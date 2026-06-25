package com.co2x.dmrv.utils;

// aca transformamos los DTO a entidades para guardar en la base
// y viceversa para cuando solicitamos un dato de la base

import com.co2x.dmrv.dto.*;
import com.co2x.dmrv.entity.*;
import com.co2x.dmrv.entity.Planta;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class Factory {

    // =========================
    // PAQUETE CO2
    // =========================


    public PaqueteCO2 toPaqueteEntity(PaqueteCO2DTO dto, Planta planta) {

        PaqueteCO2 p = new PaqueteCO2();

        p.setCertId(dto.certId);
        p.setCaptureDate(dto.captureDate);
        p.setTonCO2eq(dto.tonCO2eq);

        //p.setRetirementStatus(dto.retirementStatus);

        p.setEstado(dto.estado);
        p.setPlanta(planta);
        p.setCreatedBy(dto.createdBy);

        // 🔥 NEW campo dinámico
        p.setMetadata(dto.metadata);

        return p;
    }



    public PaqueteCO2DTO toPaqueteDTO(PaqueteCO2 entity) {

        PaqueteCO2DTO dto = new PaqueteCO2DTO();

        dto.id = entity.getId();
        dto.certId = entity.getCertId();
        dto.captureDate = entity.getCaptureDate();
        dto.tonCO2eq = entity.getTonCO2eq();

       // dto.retirementStatus = entity.getRetirementStatus();

        dto.estado = entity.getEstado();
        dto.createdBy = entity.getCreatedBy();

        dto.planta = entity.getPlanta() != null
                ? toPlantaDTO(entity.getPlanta())
                : null;



        // 🔥 NEW
        dto.metadata = entity.getMetadata();
        dto.auditor = entity.getAuditor();
        return dto;
    }



    public Planta toPlantaEntity(PlantaDTO dto) {

        Planta p = new Planta();

        p.setNombre(dto.nombre);
        p.setDireccion(dto.direccion);
        p.setLatitud(dto.latitud);
        p.setLongitud(dto.longitud);

        return p;
    }


    private NotificacionDTO toDTO(Notificacion n) {

        NotificacionDTO dto = new NotificacionDTO();

        dto.setId(n.getId());
        dto.setMensaje(n.getMensaje());
        dto.setPaqueteId(n.getPaqueteId());
        dto.setLeido(n.isLeido());
        dto.setFecha(n.getFecha());

        return dto;
    }


    public PlantaDTO toPlantaDTO(Planta entity) {

        PlantaDTO dto = new PlantaDTO();

        dto.id = entity.getId();
        dto.nombre = entity.getNombre();
        dto.direccion = entity.getDireccion();
        dto.latitud = entity.getLatitud();
        dto.longitud = entity.getLongitud();
        
        return dto;
    }

    public HistorialPaqueteDTO toHistorialDTO(HistorialPaquete h) {
        HistorialPaqueteDTO dto = new HistorialPaqueteDTO();

        dto.setId(h.getId());
        dto.setPaqueteId(h.getPaquete().getId());
        dto.setEditor(h.getEditor());
        dto.setAccion(h.getAccion());
        dto.setFecha(h.getFecha());

        try {
            ObjectMapper mapper = new ObjectMapper();
            dto.setCambios(mapper.readValue(h.getCambios(), Object.class));
        } catch (Exception e) {
            dto.setCambios(h.getCambios());
        }

        return dto;
    }



}


