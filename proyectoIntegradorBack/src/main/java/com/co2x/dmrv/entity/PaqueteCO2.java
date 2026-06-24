package com.co2x.dmrv.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;
import org.hibernate.mapping.ToOne;

import java.time.LocalDate;
import java.util.Map;

@Entity
@Table(name = "PaqueteCO2")
@Data
public class PaqueteCO2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // =====================
    // CAMPOS FIJOS (core)
    // =====================
    private String certId;
    private LocalDate captureDate;

    @Column(name = "ton_co2eq")
    @JsonProperty("tonCO2eq")
    private Double tonCO2eq;

    //private String metodologia;
    //private Boolean retirementStatus;

    @Enumerated(EnumType.STRING)
    private EstadoPaquete estado;

    @ManyToOne
    private Planta planta;

    @Column(name = "auditor")
    private String auditor;

    private String createdBy;

    @OneToOne
    @JoinColumn(name = "reporte_id")
    private Reporte reporte;


    @Column(columnDefinition = "TEXT")
    private String metadata;

    public void setIssuanceDate(LocalDate now) {
    }

}
