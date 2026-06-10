package com.co2x.dmrv.dto;
import com.co2x.dmrv.entity.EstadoPaquete;

import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.entity.Reporte;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public class PaqueteCO2DTO {

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

    public Integer plantaId;

    public String createdBy;

    public String metadata;
}