package com.co2x.dmrv.dto;
import com.co2x.dmrv.entity.EstadoPaquete;

import com.co2x.dmrv.entity.Reporte;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
@Data
public class PaqueteCO2DTO {

    @NotNull(message = "Seleccione una planta")
    public PlantaDTO planta;

    public Integer id;

    public String certId;
    public String projectName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDate captureDate;

    public Double tonCO2eq;

    public LocalDate issuanceDate;
    public Boolean retirementStatus;
    public LocalDate retirementDate;

    public String beneficiary;
    public String coBenefits;
    public String projectType;
    public String externalUrl;

    public EstadoPaquete estado;

    public Long reporteId;


    public String createdBy;
    public String auditor;
    public String metadata;
}