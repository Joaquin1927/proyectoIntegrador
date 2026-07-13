package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.CampoConErrorDTO;
import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.dto.PaqueteEdicionDTO;
import com.co2x.dmrv.entity.*;
import com.co2x.dmrv.entity.Record;
import com.co2x.dmrv.repository.HistorialPaqueteRepository;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.repository.ReporteRepository;
import com.co2x.dmrv.service.observer.PaqueteObserver;
import com.co2x.dmrv.service.observer.PaqueteSubject;
import com.co2x.dmrv.utils.Factory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Service
public class AuditoriaService  implements PaqueteSubject {

    @Autowired
    private PaqueteCO2Repository paqueteRepo;

    @Autowired
    private ReporteRepository reporteRepo;

    @Autowired
    private RecordService recordService;

    @Autowired
    private HistorialPaqueteRepository historialRepo;

    @Autowired
    private List<PaqueteObserver> observers;

    @Autowired
    private HistorialService historialService;

    @Autowired
    private Factory factory;


    @Autowired
    private SecurityService securityService;



    public void notificarCambio(
            PaqueteCO2 paquete
    )
    {
        notifyObservers(paquete);
    }





    @Override
    public void notifyObservers(PaqueteCO2 paquete) {
        for (PaqueteObserver o : observers) {
            o.update(paquete);
        }
    }


    @Transactional
    public PaqueteCO2DTO aprobar(Integer id) {

        securityService.validarAuditor();
        System.out.println("ENTRO A APROBAR");
        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

        if (paquete.getEstado() != EstadoPaquete.PENDIENTE
                && paquete.getEstado() != EstadoPaquete.EN_REVISION_CORREGIDO) {
            throw new IllegalArgumentException("El paquete no está disponible para aprobación");
        }

        EstadoPaquete estadoAnterior = paquete.getEstado();
        paquete.setEstado(EstadoPaquete.APROBADO);


        Reporte reporte = new Reporte();

        reporte.setFechaReporte(LocalDate.now());
        reporte.setToneladasCO2(paquete.getTonCO2eq());
        reporte.setPlanta(paquete.getPlanta());
        reporte.setEstado("GENERADO");
        reporte.setMetodologia("Automática");
        reporte.setUsuarioResponsable(paquete.getCreatedBy());

        reporteRepo.save(reporte);

        paquete.setReporte(reporte);

        String auditorEmail = securityService.getCurrentUserEmail();


        System.out.println("USER: " + auditorEmail);
        System.out.println("CREATED BY: " + paquete.getCreatedBy());


        paquete.setAuditor(auditorEmail);

        paqueteRepo.save(paquete);

        Record record = recordService.generateFromPaquete(paquete);
        System.out.println("Record creado con CID: " + record.getIpfsCid());


        historialService.registrarHistorial(
                paquete,
                auditorEmail,
                EstadoPaquete.APROBADO,
                List.of(
                        Map.of(
                                "campo", "estado",
                                "valorAnterior", estadoAnterior.toString(),
                                "valorNuevo", "APROBADO"
                        )
                )
        );


        notifyObservers(paquete);

        return factory.toPaqueteDTO(paquete);
    }


    @Transactional
    public PaqueteCO2DTO rechazar(Integer id, String comentario) {
        securityService.validarAuditor();
        if (comentario == null || comentario.isBlank()) {
            throw new IllegalArgumentException("El comentario de rechazo es obligatorio");
        }
        System.out.println("ENTRO A RECHAZAR");
        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));
        String auditorEmail = securityService.getCurrentUserEmail();
        paquete.setAuditor(auditorEmail);
        EstadoPaquete estadoAnterior = paquete.getEstado();
        paquete.setEstado(EstadoPaquete.RECHAZADO);



        historialService.registrarHistorial(
                paquete,
                auditorEmail,
                EstadoPaquete.RECHAZADO,
                List.of(
                        Map.of(
                                "campo", "estado",
                                "valorAnterior", estadoAnterior.toString(),
                                "valorNuevo", "RECHAZADO"
                        ),
                        Map.of(
                                "tipo", "COMENTARIO_GENERAL",
                                "texto", comentario
                        )
                )
        );
        notifyObservers(paquete);

        paqueteRepo.save(paquete);
        return factory.toPaqueteDTO(paquete);

    }

    // Compatibilidad para pruebas y consumidores internos anteriores.
    public PaqueteCO2DTO rechazar(Integer id) {
        return rechazar(id, "Rechazo registrado");
    }




    @Transactional
    public void solicitarCorreccion(Integer id, Map<String, Object> data) {

        securityService.validarAuditor();

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

        EstadoPaquete estadoAnterior = paquete.getEstado();
        System.out.println("ENTRO A CORRECCION");
        paquete.setEstado(EstadoPaquete.EN_REVISION);

        String auditorEmail = securityService.getCurrentUserEmail();
        paquete.setAuditor(auditorEmail);



        Object camposObj = data.get("campos");
        List<Map<String, Object>> campos;

        if (camposObj instanceof List<?> lista) {
            campos = lista.stream()
                    .map(item -> (Map<String, Object>) item)
                    .toList();
        } else {
            campos = List.of();
        }

        String comentarioGeneral = (String) data.getOrDefault("comentarioGeneral", "");

        System.out.println("CAMPOS: " + campos);
        System.out.println("COMENTARIO GENERAL: " + comentarioGeneral);

        paqueteRepo.save(paquete);

        Map<String, Object> cambioEstado = Map.of(
                "campo", "estado",
                "valorAnterior", estadoAnterior.toString(),
                "valorNuevo", "EN_REVISION"
        );

        List<Map<String, Object>> cambiosFinal = new ArrayList<>(campos);
        cambiosFinal.add(cambioEstado);

        if (!comentarioGeneral.isBlank()) {
            cambiosFinal.add(Map.of(
                    "tipo", "COMENTARIO_GENERAL",
                    "texto", comentarioGeneral
            ));
        }
        System.out.println("el auditor es: " + auditorEmail);
        historialService.registrarHistorial(
                paquete,
                auditorEmail,
                EstadoPaquete.EN_REVISION,
                cambiosFinal
        );

        notifyObservers(paquete);


        System.out.println("✅ SOLICITAR CORRECCION COMPLETO");
    }




    public PaqueteEdicionDTO getPaqueteParaEdicion(Integer id) {

        System.out.println("1");

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

        System.out.println("2");

        String usuario = securityService.getCurrentUserEmail();

        System.out.println("3");
        System.out.println("USER: " + usuario);
        System.out.println("CREATED BY: " + paquete.getCreatedBy());

        System.out.println("4");
        System.out.println("ESTADO: " + paquete.getEstado());

        if (paquete.getEstado() != EstadoPaquete.EN_REVISION) {
            throw new RuntimeException("El paquete no está en revisión");
        }

        System.out.println("5");


        Optional<HistorialPaquete> test =
                historialRepo.findTopByPaqueteIdOrderByFechaDesc(paquete.getId());

        System.out.println("OPTIONAL VACIO: " + test.isEmpty());

        if (test.isPresent()) {
            System.out.println("HISTORIAL ID: " + test.get().getId());
        }

        HistorialPaquete ultimo =
                test.orElseThrow(() -> new RuntimeException("No hay historial"));


        System.out.println("6");

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
}
