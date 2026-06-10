package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.repository.PlantaRepository;
import com.co2x.dmrv.utils.Factory;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.ObjectMapper;

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



    private Map<String, Object> procesarMetadata(String metadataJson) {

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

        Planta planta = plantaService.getEntity(dto.plantaId);

        PaqueteCO2 entity = factory.toPaqueteEntity(dto, planta);

        ObjectMapper mapper = new ObjectMapper();

        // ✅ USAR SOLO procesarMetadata
        Map<String, Object> metadataMap = procesarMetadata(dto.metadata);

        System.out.println("METADATA MAP: " + metadataMap);
        System.out.println("TIPO TON: " + metadataMap.get("_tonCO2eq").getClass());


        // ✅ extraer ton ya validado

        Object tonObj = metadataMap.get("_tonCO2eq");

        Double ton;

        if (tonObj instanceof Number) {
            ton = ((Number) tonObj).doubleValue();
        } else {
            throw new RuntimeException("tonCO2eq inválido en metadata");
        }

        entity.setTonCO2eq(ton);

        // ✅ guardar metadata limpio
        entity.setMetadata(mapper.writeValueAsString(metadataMap));

        // 🔥 AUTO VALUES
        entity.setEstado(EstadoPaquete.PENDIENTE);
        entity.setIssuanceDate(LocalDate.now());

        String fecha = LocalDate.now().toString().replace("-", "");
        Long count = paqueteRepo.countByPlanta(planta);

        String certId = "CO2X-" + planta.getId() + "-" + fecha + "-" + (count + 1);
        entity.setCertId(certId);






        var auth = SecurityContextHolder.getContext().getAuthentication();

        String email = "desconocido";

        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {

            email = jwt.getClaimAsString("preferred_username");

            if (email == null) {
                email = jwt.getClaimAsString("email");
            }

            if (email == null) {
                email = jwt.getSubject();
            }
        }

// 🔥 fallback al frontend
        if ((email == null || email.equals("desconocido")) && dto.createdBy != null) {
            email = dto.createdBy;
        }

        entity.setCreatedBy(email);





        PaqueteCO2 guardado = paqueteRepo.save(entity);

        return factory.toPaqueteDTO(guardado);
    }


}