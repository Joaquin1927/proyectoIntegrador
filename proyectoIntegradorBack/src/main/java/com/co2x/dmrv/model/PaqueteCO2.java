package com.co2x.dmrv.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
public class PaqueteCO2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String certId;
    private String projectName;
    private LocalDate captureDate;
    private String verifiedBy;
    private String methodology;
    private String location;
    private Double tonCO2eq;
    private LocalDate issuanceDate;
    private Boolean retirementStatus;
    private LocalDate retirementDate;
    private String beneficiary;
    private String coBenefits;
    private String projectType;
    private String externalUrl;

    @ManyToOne
    @JoinColumn(name = "reporte_id")
    private Reporte reporte;
}