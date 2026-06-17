package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.entity.*;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.repository.PlantaRepository;
import com.co2x.dmrv.repository.ReporteRepository;
import com.co2x.dmrv.repository.UsuarioRepository;
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
public class PaqueteCO2Service {

    @Autowired
    private PaqueteCO2Repository paqueteRepo;

    @Autowired
    private Factory factory;

    @Autowired
    private ReporteRepository reporteRepo;

    @Autowired
    private PlantaService plantaService;

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

        // ✅ usar factory
        PaqueteCO2 entity = factory.toPaqueteEntity(dto, planta);

        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> metadataMap = procesarMetadata(dto.metadata);

        // ✅ extraer ton
        Object tonObj = metadataMap.get("_tonCO2eq");

        Double ton;
        if (tonObj instanceof Number) {
            ton = ((Number) tonObj).doubleValue();
        } else {
            throw new RuntimeException("tonCO2eq inválido en metadata");
        }

        entity.setTonCO2eq(ton);

        entity.setMetadata(mapper.writeValueAsString(metadataMap));

        // ✅ valores automáticos
        entity.setEstado(EstadoPaquete.PENDIENTE);
        entity.setIssuanceDate(LocalDate.now());

        String fecha = LocalDate.now().toString().replace("-", "");
        Long count = paqueteRepo.countByPlanta(planta);

        String certId = "CO2X-" + planta.getId() + "-" + fecha + "-" + (count + 1);
        entity.setCertId(certId);

        // ✅ usuario
        var auth = SecurityContextHolder.getContext().getAuthentication();

        String email = "desconocido";

        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            email = jwt.getClaimAsString("preferred_username");

            if (email == null) email = jwt.getClaimAsString("email");
            if (email == null) email = jwt.getSubject();
        }

        if ((email == null || email.equals("desconocido")) && dto.createdBy != null) {
            email = dto.createdBy;
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

        paqueteRepo.save(paquete);

        var auth = SecurityContextHolder.getContext().getAuthentication();

        String auditor = "desconocido";

        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            auditor = jwt.getClaimAsString("preferred_username");

            if (auditor == null) auditor = jwt.getClaimAsString("email");
            if (auditor == null) auditor = jwt.getSubject();
        }
//dsfdsfdsfewresdfdsfdsdfsewew
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