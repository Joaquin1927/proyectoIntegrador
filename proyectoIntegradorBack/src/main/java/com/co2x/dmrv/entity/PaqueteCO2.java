package com.co2x.dmrv.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "\"PaqueteCO2\"")
public class PaqueteCO2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Integer id;

    @Column(name = "\"cert_Id\"", nullable = false)
    private String certId;

    @Column(name = "\"project_Name\"")
    private String projectName;

    @Column(name = "\"capture_Date\"")
    private LocalDate captureDate;

    @Column(name = "\"metodologia\"")
    private String metodologia;

    @Column(name = "\"ton_co2eq\"")
    private Double tonCO2eq;

    @Column(name = "\"issuance_date\"")
    private LocalDate issuanceDate;

    @Column(name = "\"retirement_status\"")
    private Boolean retirementStatus;

    @Column(name = "\"retirement_date\"")
    private LocalDate retirementDate;

    @Column(name = "\"beneficiary\"")
    private String beneficiary;

    @Column(name = "\"co_benefits\"")
    private String coBenefits;

    @Column(name = "\"project_type\"")
    private String projectType;

    @Column(name = "\"external_url\"")
    private String externalUrl;

    @ManyToOne
    @JoinColumn(name = "\"verifiedBy\"")
    private Usuario auditor;

    @ManyToOne
    @JoinColumn(name = "\"ubicacion\"")
    private Planta planta;

    @ManyToOne
    @JoinColumn(name = "\"reporte_Id\"")
    private Reporte reporte;
}