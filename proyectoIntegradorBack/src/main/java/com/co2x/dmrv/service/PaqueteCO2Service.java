package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.entity.*;
import com.co2x.dmrv.entity.Record;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.repository.PlantaRepository;
import com.co2x.dmrv.repository.ReporteRepository;
import com.co2x.dmrv.repository.UsuarioRepository;
import com.co2x.dmrv.service.observer.PaqueteObserver;
import com.co2x.dmrv.service.observer.PaqueteSubject;
import com.co2x.dmrv.utils.Factory;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;


import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.Arrays.stream;

@Service
public class PaqueteCO2Service  implements PaqueteSubject {
    @Autowired
    private List<PaqueteObserver> observers;




    @Override
    public void addObserver(PaqueteObserver observer) {
        observers.add(observer);
    }

    @Override
    public void removeObserver(PaqueteObserver observer) {
        observers.remove(observer);
    }

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
    private PlantaService plantaService;

    @Autowired
    private RecordService recordService;

    public List<PaqueteCO2DTO> listar() {
        return paqueteRepo.findAll()
                .stream()
                .map(factory::toPaqueteDTO)
                .toList();
    }
    public List<PaqueteCO2DTO> listarPendientes() {

        return paqueteRepo
                .findByEstado(EstadoPaquete.PENDIENTE)
                .stream()
                .map(factory::toPaqueteDTO)
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

            // 🔥 CAMPOS PROTEGIDOS
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

        var auth = SecurityContextHolder.getContext().getAuthentication();

        String email = "desconocido";


        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {

            System.out.println("CLAIMS: " + jwt.getClaims());

            email = (String) jwt.getClaims().get("unique_name");

            if (email == null || email.isBlank())
                email = (String) jwt.getClaims().get("upn");

            if (email == null || email.isBlank())
                email = (String) jwt.getClaims().get("preferred_username");

            if (email == null || email.isBlank())
                email = (String) jwt.getClaims().get("email");

            if (email == null || email.isBlank()) {
                throw new RuntimeException("Token inválido: no contiene email");
            }

        }

        entity.setCreatedBy(email);

        PaqueteCO2 guardado = paqueteRepo.save(entity);

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


    private String getCurrentUserEmailStrict() {

        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (!(auth != null && auth.getPrincipal() instanceof Jwt jwt)) {
            throw new RuntimeException("No autenticado correctamente");
        }

        System.out.println("CLAIMS: " + jwt.getClaims());

        String email = (String) jwt.getClaims().get("unique_name");

        if (email == null || email.isBlank())
            email = (String) jwt.getClaims().get("upn");

        if (email == null || email.isBlank())
            email = (String) jwt.getClaims().get("preferred_username");

        if (email == null || email.isBlank())
            email = (String) jwt.getClaims().get("email");

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Token inválido: no contiene email");
        }

        return email;
    }

    private void validarAuditor() {

        var auth = SecurityContextHolder.getContext().getAuthentication();


        if (auth == null) {
            System.out.println("❌ AUTH ES NULL");
            throw new RuntimeException("Usuario no autenticado");
        }

        System.out.println("AUTH CLASS: " + auth.getClass());

        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) {
            throw new RuntimeException("Usuario no autenticado");
        }

        Jwt jwt = jwtAuth.getToken();

        System.out.println("JWT CLAIMS: " + jwt.getClaims());

        List<String> roles = jwt.getClaimAsStringList("roles");

        if (roles == null || roles.stream().noneMatch(r -> r.equalsIgnoreCase("auditor"))) {
            throw new RuntimeException("Acceso solo para auditores");
        }
    }








    public PaqueteCO2DTO aprobar(Integer id) {

        validarAuditor();

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

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

        String auditorEmail = getCurrentUserEmailStrict();
        paquete.setAuditor(auditorEmail);

        // ✅ guardar cambios
        paqueteRepo.save(paquete);

        // ✅ IPFS (de tu compañera)
        Record record = recordService.generateFromPaquete(paquete);
        System.out.println("Record creado con CID: " + record.getIpfsCid());

        // ✅ NOTIFICACIONES (tu lógica)
        notifyObservers(paquete);

        return factory.toPaqueteDTO(paquete);
    }


    public PaqueteCO2DTO rechazar(Integer id) {
        validarAuditor();

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

        // ✅ cambiar estado
        paquete.setEstado(EstadoPaquete.RECHAZADO);

        return factory.toPaqueteDTO(paquete);

    }


    public void solicitarCorreccion(Integer id, Map<String, Object> data) {

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

        paquete.setEstado(EstadoPaquete.EN_REVISION);

        paqueteRepo.save(paquete);

        // después podés guardar comentarios
    }

}