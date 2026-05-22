package com.co2x.dmrv.utils;

// aca transformamos los DTO a entidades para guardar en la base
// y viceversa para cuando solicitamos un dato de la base

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.dto.ReporteDTO;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Reporte;
import org.springframework.stereotype.Component;

@Component
public class Factory {

    // =========================
    // PAQUETE CO2
    // =========================

    public PaqueteCO2 toPaqueteEntity(PaqueteCO2DTO dto, Reporte reporte) {

        PaqueteCO2 p = new PaqueteCO2();


        p.setCertId(dto.id != null ? dto.certId : dto.certId);
        p.setProjectName(dto.projectName);
        p.setCaptureDate(dto.captureDate);
        p.setVerifiedBy(dto.verifiedBy);
        p.setMethodology(dto.methodology);
        p.setLocation(dto.location);
        p.setTonCO2eq(dto.tonCO2eq);
        p.setIssuanceDate(dto.issuanceDate);
        p.setRetirementStatus(dto.retirementStatus);
        p.setRetirementDate(dto.retirementDate);
        p.setBeneficiary(dto.beneficiary);
        p.setCoBenefits(dto.coBenefits);
        p.setProjectType(dto.projectType);
        p.setExternalUrl(dto.externalUrl);

        p.setReporte(reporte);

        return p;
    }

    public PaqueteCO2DTO toPaqueteDTO(PaqueteCO2 entity) {

        PaqueteCO2DTO dto = new PaqueteCO2DTO();

        dto.id = entity.getId();
        dto.certId = entity.getCertId();
        dto.projectName = entity.getProjectName();
        dto.captureDate = entity.getCaptureDate();
        dto.verifiedBy = entity.getVerifiedBy();
        dto.methodology = entity.getMethodology();
        dto.location = entity.getLocation();
        dto.tonCO2eq = entity.getTonCO2eq();
        dto.issuanceDate = entity.getIssuanceDate();
        dto.retirementStatus = entity.getRetirementStatus();
        dto.retirementDate = entity.getRetirementDate();
        dto.beneficiary = entity.getBeneficiary();
        dto.coBenefits = entity.getCoBenefits();
        dto.projectType = entity.getProjectType();
        dto.externalUrl = entity.getExternalUrl();

        if (entity.getReporte() != null) {
            dto.reporteId = entity.getReporte().getId();
        }

        return dto;
    }

    // =========================
    //  REPORTE
    // =========================

    public Reporte toReporteEntity(ReporteDTO dto) {

        Reporte r = new Reporte();

        r.setFechaCaptura(dto.fechaCaptura);
        r.setToneladasCO2(dto.toneladasCO2);
        r.setLocacion(dto.locacion);

        // falta
        // empleado y planta

        return r;
    }

    public ReporteDTO toReporteDTO(Reporte entity) {

        ReporteDTO dto = new ReporteDTO();

        dto.id = entity.getId();
        dto.fechaCaptura = entity.getFechaCaptura();
        dto.toneladasCO2 = entity.getToneladasCO2();
        dto.locacion = entity.getLocacion();

        // ver si agregar relaciones:
        // dto.empleadoId = entity.getEmpleado().getId();
        // dto.plantaId = entity.getPlanta().getId();

        return dto;
    }
}
