package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.CampoConErrorDTO;
import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.dto.PaqueteEdicionDTO;
import com.co2x.dmrv.entity.*;
import com.co2x.dmrv.entity.Record;
import com.co2x.dmrv.repository.*;
import com.co2x.dmrv.service.observer.PaqueteObserver;
import com.co2x.dmrv.service.observer.PaqueteSubject;
import com.co2x.dmrv.utils.Factory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;


import java.time.LocalDateTime;
import java.util.*;

import static java.util.Arrays.stream;

@Service
public class PaqueteCO2Service  implements PaqueteSubject {
    @Autowired
    private List<PaqueteObserver> observers;
    @Autowired
    private HistorialPaqueteRepository historialRepo;





    @Override
    public void notifyObservers(PaqueteCO2 paquete) {
        for (PaqueteObserver o : observers) {
            o.update(paquete);
        }
    }
    @Autowired
    private PaqueteCO2Repository paqueteRepo;

    @Autowired
    private Factory factory;

    @Autowired
    private ReporteRepository reporteRepo;

    @Autowired
    private NotificacionRepository notificacionRepo;

    @Autowired
    private PlantaService plantaService;

    @Autowired
    private HistorialService historialService;

    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired
    private RecordService recordService;


    @Autowired
    private SecurityService securityService;







    public List<PaqueteCO2DTO> listar() {
        return paqueteRepo.findAll()
                .stream()
                .map(factory::toPaqueteDTO)
                .toList();
    }
    public List<PaqueteCO2DTO> listarPendientes() {



        return paqueteRepo
                .findByEstadoIn(
                        List.of(
                                EstadoPaquete.PENDIENTE,
                                EstadoPaquete.EN_REVISION_CORREGIDO
                        )
                )
                .stream()
                .map(paquete -> {

                    PaqueteCO2DTO dto =
                            factory.toPaqueteDTO(paquete);

                    dto.setNumeroRevision(
                            historialService.obtenerNumeroRevision(
                                    paquete.getId()
                            )
                    );

                    return dto;

                })
                .toList();


    }

    public List<PaqueteCO2DTO> listarPorUsuario(String email) {
        return paqueteRepo.findByCreatedBy(email)
                .stream()
                .map(factory::toPaqueteDTO)
                .toList();
    }




    public Map<String, Object> procesarMetadata(String metadataJson) {

        if (metadataJson == null || metadataJson.isBlank()) {
            throw new IllegalArgumentException("metadata no puede ser vacío");
        }

        try {
            ObjectMapper mapper = new ObjectMapper();

            Map<String, Object> metadataMap =
                    mapper.readValue(metadataJson, Map.class);

            Set<String> forbiddenFields = Set.of(
                    "certId",
                    "createdBy",
                    "estado",
                    "issuanceDate",
                    "id"
            );

            forbiddenFields.forEach(metadataMap::remove);

            // 🔥 VALIDAR tonCO2eq
            Object tonObj = metadataMap.get("tonCO2eq");

            if (tonObj == null) {
                throw new IllegalArgumentException("tonCO2eq es obligatorio");
            }

            double ton;

            if (tonObj instanceof Number) {
                ton = ((Number) tonObj).doubleValue();
            } else {
                ton = Double.parseDouble(tonObj.toString());
            }

            if (ton <= 0) {
                throw new IllegalArgumentException("tonCO2eq debe ser mayor a 0");
            }

            metadataMap.remove("tonCO2eq");
            metadataMap.put("_tonCO2eq", ton);

            return metadataMap;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error parseando metadata: " + e.getMessage());
        }
    }




    public PaqueteCO2DTO crear(PaqueteCO2DTO dto) throws JsonProcessingException {

        if (dto.planta == null || dto.planta.id == null) {
            throw new RuntimeException("Planta es obligatoria");
        }

        System.out.println("PLANTA DTO: " + dto.planta);
        System.out.println("PLANTA ID: " + dto.planta.id);
        System.out.println("PLANTA NOMBRE: " + dto.planta.nombre);


        Planta planta = plantaService.getEntity(dto.planta.id);

        PaqueteCO2 entity = factory.toPaqueteEntity(dto, planta);

        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> metadataMap = procesarMetadata(dto.metadata);

        Object tonObj = metadataMap.get("_tonCO2eq");

        Double ton;
        if (tonObj instanceof Number) {
            ton = ((Number) tonObj).doubleValue();
        } else {
            throw new RuntimeException("tonCO2eq inválido en metadata");
        }

        entity.setTonCO2eq(ton);

        entity.setMetadata(mapper.writeValueAsString(metadataMap));

        entity.setEstado(EstadoPaquete.PENDIENTE);
        entity.setIssuanceDate(LocalDate.now());

        String fecha = LocalDate.now().toString().replace("-", "");
        Long count = paqueteRepo.countByPlanta(planta);

        String certId = "CO2X-" + planta.getId() + "-" + fecha + "-" + (count + 1);
        entity.setCertId(certId);


        String email = securityService.getCurrentUserEmail();;

        System.out.println(
                "EMAIL OBTENIDO: "
                        + securityService.getCurrentUserEmail()
        );

        entity.setCreatedBy(email);

        System.out.println(
                "CREATEDBY ANTES SAVE: "
                        + entity.getCreatedBy()
        );

        PaqueteCO2 guardado = paqueteRepo.save(entity);


        historialService.registrarHistorial(
                entity,
                email,
                EstadoPaquete.PENDIENTE,
                List.of(
                        Map.of(
                                "tipo", "CREACION",
                                "descripcion", "Paquete creado"
                        )
                )
        );


        return factory.toPaqueteDTO(guardado);
    }



    public PaqueteCO2DTO obtenerPorId(Integer id) {

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Paquete no encontrado con id " + id
                        )
                );

        return factory.toPaqueteDTO(paquete);
    }



    public PaqueteEdicionDTO getPaqueteParaEdicion(Integer id) {


        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));




        securityService.validarPropietario(
                paquete.getCreatedBy()
        );





        if
        (
                paquete.getEstado() != EstadoPaquete.EN_REVISION
                        &&
                        paquete.getEstado() != EstadoPaquete.EN_REVISION_CORREGIDO
        )
        {
            throw new RuntimeException("El paquete no está en revisión");
        }



        Optional<HistorialPaquete> test =
                historialService.obtenerUltimoHistorial(paquete.getId());

        System.out.println("OPTIONAL VACIO: " + test.isEmpty());

        if (test.isPresent()) {
            System.out.println("HISTORIAL ID: " + test.get().getId());
        }

        HistorialPaquete ultimo =
                test.orElseThrow(() -> new RuntimeException("No hay historial"));



        return construirDTOEdicion(paquete, ultimo);
    }



    private PaqueteEdicionDTO construirDTOEdicion(
            PaqueteCO2 paquete,
            HistorialPaquete historial
    ) {

        try {


            System.out.println("ENTRANDO A construirDTOEdicion");

            System.out.println("METADATA RAW:");
            System.out.println(paquete.getMetadata());

            System.out.println("CAMBIOS RAW:");
            System.out.println(historial.getCambios());


            ObjectMapper mapper = new ObjectMapper();

            PaqueteEdicionDTO dto = new PaqueteEdicionDTO();

            dto.setId(paquete.getId());
            dto.setEstado(paquete.getEstado().name());
            dto.setCreatedBy(paquete.getCreatedBy());

            dto.setMetadata(
                    mapper.readValue(
                            paquete.getMetadata(),
                            new TypeReference<Map<String, Object>>() {}
                    )
            );

            List<Map<String, Object>> cambios =
                    mapper.readValue(
                            historial.getCambios(),
                            new TypeReference<List<Map<String, Object>>>() {}
                    );

            List<CampoConErrorDTO> campos = new ArrayList<>();

            String comentarioGeneral = "";

            for (Map<String, Object> cambio : cambios) {

                if
                (
                        cambio.containsKey("campo") &&
                                cambio.containsKey("comentario")
                )
                {

                    CampoConErrorDTO campo = new CampoConErrorDTO();

                    campo.setCampo(
                            (String) cambio.get("campo")
                    );

                    campo.setComentario(
                            (String) cambio.get("comentario")
                    );

                    campos.add(campo);
                }

                if ("COMENTARIO_GENERAL".equals(cambio.get("tipo"))) {

                    comentarioGeneral =
                            (String) cambio.get("texto");
                }
            }

            dto.setCamposConError(campos);
            dto.setComentarioGeneral(comentarioGeneral);

            return dto;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(
                    "Error armando DTO de edición",
                    e
            );
        }
    }



    public PaqueteCO2DTO corregirPaquete(
            Integer id,
            PaqueteEdicionDTO dto
    ) {

        PaqueteCO2 paquete =
                paqueteRepo.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Paquete no encontrado"
                                )
                        );

        String usuario =
                securityService.getCurrentUserEmail();


        securityService.validarPropietario(
                paquete.getCreatedBy()
        );


        if (
                paquete.getEstado()
                        != EstadoPaquete.EN_REVISION
        ) {
            throw new RuntimeException(
                    "El paquete no está en revisión"
            );
        }

        ObjectMapper mapper =
                new ObjectMapper();

        try {

            paquete.setMetadata(
                    mapper.writeValueAsString(
                            dto.getMetadata()
                    )
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Error procesando metadata"
            );
        }

        paquete.setEstado(
                EstadoPaquete.EN_REVISION_CORREGIDO
        );

        paqueteRepo.save(paquete);

        historialService.registrarHistorial(
                paquete,
                usuario,
                EstadoPaquete.EN_REVISION_CORREGIDO,
                List.of(
                        Map.of(
                                "tipo",
                                "CORRECCION"
                        )
                )
        );
        auditoriaService.notificarCambio(paquete);

        return factory.toPaqueteDTO(
                paquete
        );
    }



}