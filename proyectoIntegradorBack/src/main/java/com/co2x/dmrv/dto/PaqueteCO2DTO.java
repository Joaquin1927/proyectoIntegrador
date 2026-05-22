package com.co2x.dmrv.dto;

import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.entity.Reporte;

import java.time.LocalDate;

public class PaqueteCO2DTO {

    public Integer id; // opcional en create

    public String certId;
    public String projectName;
    public LocalDate captureDate;
    public Double tonCO2eq;
    public LocalDate issuanceDate;
    public Boolean retirementStatus;
    public LocalDate retirementDate;
    public String beneficiary;
    public String coBenefits;
    public String projectType;
    public String externalUrl;

    public Long reporteId;
    public Planta planta;
}