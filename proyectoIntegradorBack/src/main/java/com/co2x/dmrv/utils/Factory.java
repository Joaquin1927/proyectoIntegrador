package com.co2x.dmrv.utils;

// aca transformamos los DTO a entidades para guardar en la base
// y viceversa para cuando solicitamos un dato de la base

import com.co2x.dmrv.dto.*;
import com.co2x.dmrv.entity.*;
import com.co2x.dmrv.entity.Planta;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

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



    private NotificacionDTO toDTO(Notificacion n) {

        NotificacionDTO dto = new NotificacionDTO();

        dto.setId(n.getId());
        dto.setMensaje(n.getMensaje());
        dto.setPaqueteId(n.getPaqueteId());
        dto.setLeido(n.isLeido());
        dto.setFecha(n.getFecha());

        return dto;
    }



    public HistorialPaqueteDTO toHistorialDTO(HistorialPaquete h) {
        HistorialPaqueteDTO dto = new HistorialPaqueteDTO();

        dto.setId(h.getId());
        dto.setPaqueteId(h.getPaquete().getId());
        dto.setEditor(h.getEditor());
        System.out.println("EDITOR EN DTO: "+ h.getEditor());
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


    public Planta toPlantaEntity(PlantaDTO dto) {
        Planta p = new Planta();
        p.setId(dto.getId());
        p.setNombre(dto.getNombre());
        p.setDireccion(dto.getDireccion());
        p.setManagerEmail(dto.getManagerEmail());
        p.setMetadata(dto.getMetadata());
        p.setPdfTecnico(dto.getPdfTecnico());
        if (dto.getPozos() != null) {
            p.setPozos(
                    dto.getPozos().stream().map(pozoDTO -> {
                        Pozo pozo = new Pozo();
                        pozo.setNombre(pozoDTO.getNombre());
                        pozo.setPlanta(p);
                        return pozo;
                    }).collect(Collectors.toList())
            );
        }
        return p;
    }

    public PlantaDTO toPlantaDTO(Planta entity) {
        PlantaDTO dto = new PlantaDTO();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        if (entity.getEmpresa() != null) {
            EmpresaDTO empresaDTO = new EmpresaDTO();
            empresaDTO.setId(
                    entity.getEmpresa().getId()
            );
            empresaDTO.setNombre(
                    entity.getEmpresa().getNombre()
            );
            dto.setEmpresa(empresaDTO);
        }

        dto.setDireccion(entity.getDireccion());
        dto.setManagerEmail(entity.getManagerEmail());
        dto.setMetadata(entity.getMetadata());
        dto.setPdfTecnico(entity.getPdfTecnico());

        if (entity.getPozos() != null) {
            dto.setPozos(
                    entity.getPozos().stream().map(pozo -> {
                        PozoDTO pozoDTO = new PozoDTO();
                        pozoDTO.setId(pozo.getId());
                        pozoDTO.setNombre(pozo.getNombre());
                        return pozoDTO;
                    }).collect(Collectors.toList())
            );
        }

        return dto;
    }





}


