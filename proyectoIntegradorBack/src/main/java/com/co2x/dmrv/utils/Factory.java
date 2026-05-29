package com.co2x.dmrv.utils;

// aca transformamos los DTO a entidades para guardar en la base
// y viceversa para cuando solicitamos un dato de la base

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.dto.ReporteDTO;
import com.co2x.dmrv.dto.PlantaDTO;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.entity.Reporte;
import org.springframework.stereotype.Component;

@Component
public class Factory {

    // =========================
    // PAQUETE CO2
    // =========================

    public PaqueteCO2 toPaqueteEntity(PaqueteCO2DTO dto, Planta planta) {

        PaqueteCO2 p = new PaqueteCO2();

        // ⚠️ nunca seteamos ID

        p.setCertId(dto.certId);
        p.setProjectName(dto.projectName);
        p.setCaptureDate(dto.captureDate);
        p.setTonCO2eq(dto.tonCO2eq);
        p.setIssuanceDate(dto.issuanceDate);
        p.setRetirementStatus(dto.retirementStatus);
        p.setRetirementDate(dto.retirementDate);
        p.setBeneficiary(dto.beneficiary);
        p.setCoBenefits(dto.coBenefits);
        p.setProjectType(dto.projectType);
        p.setExternalUrl(dto.externalUrl);

        p.setPlanta(planta);

        return p;
    }

    public PaqueteCO2DTO toPaqueteDTO(PaqueteCO2 entity) {

        PaqueteCO2DTO dto = new PaqueteCO2DTO();

        dto.id = entity.getId();
        dto.certId = entity.getCertId();
        dto.projectName = entity.getProjectName();
        dto.captureDate = entity.getCaptureDate();
        dto.tonCO2eq = entity.getTonCO2eq();
        dto.issuanceDate = entity.getIssuanceDate();
        dto.retirementStatus = entity.getRetirementStatus();
        dto.retirementDate = entity.getRetirementDate();
        dto.beneficiary = entity.getBeneficiary();
        dto.coBenefits = entity.getCoBenefits();
        dto.projectType = entity.getProjectType();
        dto.externalUrl = entity.getExternalUrl();

        if (entity.getPlanta() != null) {
            dto.id = entity.getPlanta().getId();
        }

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

    public PlantaDTO toPlantaDTO(Planta entity) {

        PlantaDTO dto = new PlantaDTO();

        dto.id = entity.getId();
        dto.nombre = entity.getNombre();
        dto.direccion = entity.getDireccion();
        dto.latitud = entity.getLatitud();
        dto.longitud = entity.getLongitud();

        return dto;
    }

}


