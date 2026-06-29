package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.entity.*;
import com.co2x.dmrv.entity.Record;
import com.co2x.dmrv.repository.*;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.Arrays.stream;

@Service
public class PaqueteCO2Service  implements PaqueteSubject {
    @Autowired
    private List<PaqueteObserver> observers;
    @Autowired
    private HistorialPaqueteRepository historialRepo;




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
    private NotificacionRepository notificacionRepo;

    @Autowired
    private PlantaService plantaService;

    @Autowired
    private RecordService recordService;


    private void registrarHistorial(
            PaqueteCO2 paquete,
            String usuario,
            EstadoPaquete accion,
            List<Map<String, Object>> cambios
    ) {

        try {
            ObjectMapper mapper = new ObjectMapper();

            HistorialPaquete h = new HistorialPaquete();

            h.setPaquete(paquete);

            h.setEditor(usuario);
            h.setAccion(accion);
            h.setFecha(LocalDateTime.now());

            h.setSnapshot(generarSnapshot(paquete));

            if (cambios != null && !cambios.isEmpty()) {
                h.setCambios(mapper.writeValueAsString(cambios));
            } else {
                h.setCambios("[]");
            }

            historialRepo.save(h);

            System.out.println("✅ Historial guardado correctamente");

        } catch (Exception e) {
            System.out.println("💥 ERROR EN registrarHistorial:");
            e.printStackTrace();
        }
    }





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


        registrarHistorial(
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


    private void crearNotificacion(String usuario, String mensaje,Integer paqueteId) {

        Notificacion n = new Notificacion();

        n.setUsuario(usuario);
        n.setMensaje(mensaje);
        n.setLeido(false);
        n.setPaqueteId(paqueteId);
        n.setFecha(LocalDateTime.now());

        notificacionRepo.save(n);

        System.out.println("📩 Notificación creada para " + usuario);
    }


    private String getCurrentUserEmailSafe() {

        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {

            System.out.println("CLAIMS: " + jwt.getClaims());

            String email = jwt.getClaimAsString("preferred_username");

            if (email == null || email.isBlank())
                email = jwt.getClaimAsString("email");

            if (email == null || email.isBlank())
                email = jwt.getClaimAsString("upn");

            if (email == null || email.isBlank())
                email = jwt.getSubject();

            if (email != null && !email.isBlank()) {
                return email;
            }
        }

        // ✅ fallback seguro
        System.out.println("⚠ Usuario fallback utilizado");
        return "desconocido";
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





    private String generarSnapshot(PaqueteCO2 p) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            Map<String, Object> snap = Map.of(
                    "id", p.getId(),
                    "estado", p.getEstado(),
                    "tonCO2eq", p.getTonCO2eq(),
                    "planta", p.getPlanta() != null ? p.getPlanta().getNombre() : null,
                    "metadata", p.getMetadata()
            );

            return mapper.writeValueAsString(snap);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }






    public PaqueteCO2DTO aprobar(Integer id) {

        validarAuditor();

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

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

        String auditorEmail = getCurrentUserEmailSafe();
        paquete.setAuditor(auditorEmail);

        paqueteRepo.save(paquete);

        Record record = recordService.generateFromPaquete(paquete);
        System.out.println("Record creado con CID: " + record.getIpfsCid());



        registrarHistorial(
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

        // ✅ NOTIFICACIÓN
        crearNotificacion(
                paquete.getCreatedBy(),
                "El paquete " + paquete.getId() + " ha sido aprobado",
                paquete.getId()
        );


        return factory.toPaqueteDTO(paquete);
    }


    public PaqueteCO2DTO rechazar(Integer id) {
        validarAuditor();

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));
        String auditorEmail = getCurrentUserEmailSafe();
        paquete.setAuditor(auditorEmail);
        EstadoPaquete estadoAnterior = paquete.getEstado();
        paquete.setEstado(EstadoPaquete.RECHAZADO);



        registrarHistorial(
                paquete,
                auditorEmail,
                EstadoPaquete.RECHAZADO,
                List.of(
                        Map.of(
                                "campo", "estado",
                                "valorAnterior", estadoAnterior.toString(),
                                "valorNuevo", "RECHAZADO"
                        )
                )
        );

        // ✅ NOTIFICACIÓN
        crearNotificacion(
                paquete.getCreatedBy(),
                "El paquete " + paquete.getId() + " ha sido rechazado",
                paquete.getId()
        );


        return factory.toPaqueteDTO(paquete);

    }




    public void solicitarCorreccion(Integer id, Map<String, Object> data) {

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

        EstadoPaquete estadoAnterior = paquete.getEstado();

        paquete.setEstado(EstadoPaquete.EN_REVISION);

        String auditorEmail = getCurrentUserEmailSafe();
        paquete.setAuditor(auditorEmail);

        // ✅ CAMPOS
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

        registrarHistorial(
                paquete,
                auditorEmail,
                EstadoPaquete.EN_REVISION,
                cambiosFinal
        );


        // ✅ NOTIFICACIÓN
        crearNotificacion(
                paquete.getCreatedBy(),
                "El paquete " + paquete.getId() + " fue enviado a revisión",
                paquete.getId()
        );

        System.out.println("✅ SOLICITAR CORRECCION COMPLETO");
    }


}