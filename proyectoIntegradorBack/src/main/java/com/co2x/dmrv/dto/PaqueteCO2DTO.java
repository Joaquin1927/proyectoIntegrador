package com.co2x.dmrv.dto;

import java.time.LocalDate;

public class PaqueteCO2DTO {

    public Long id; // opcional en create

    public String certId;
    public String projectName;
    public LocalDate captureDate;
    public String verifiedBy;
    public String methodology;
    public String location;
    public Double tonCO2eq;
    public LocalDate issuanceDate;
    public Boolean retirementStatus;
    public LocalDate retirementDate;
    public String beneficiary;
    public String coBenefits;
    public String projectType;
    public String externalUrl;

    public Long reporteId;
}