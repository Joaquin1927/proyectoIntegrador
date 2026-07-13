package com.co2x.dmrv.dto;
import com.co2x.dmrv.entity.EstadoPaquete;

import com.co2x.dmrv.entity.Reporte;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
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
    @NotNull(message = "La fecha de captura es obligatoria")
    @PastOrPresent(message = "La fecha de captura no puede ser futura")
    public LocalDate captureDate;

    public Double tonCO2eq;

    public LocalDate issuanceDate;
    public Boolean retirementStatus;
    public LocalDate retirementDate;

    public String beneficiary;
    public String coBenefits;
    public String projectType;
    public String externalUrl;
    private Integer numeroRevision;
    public EstadoPaquete estado;

    public Long reporteId;


    public String createdBy;
    public String auditor;
    @NotBlank(message = "Los metadatos son obligatorios")
    public String metadata;
}
