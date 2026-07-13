package com.co2x.dmrv.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@ToString(exclude = {"planta", "historial"})
@Entity
@Table(name = "PaqueteCO2")
@Data
public class PaqueteCO2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "cert_id", unique = true)
    private String certId;

    @Column(name = "data_fingerprint", length = 64, unique = true)
    private String dataFingerprint;
    private LocalDate captureDate;

    @Column(name = "ton_co2eq")
    @JsonProperty("tonCO2eq")
    private Double tonCO2eq;


    @OneToMany(mappedBy = "paquete", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<HistorialPaquete> historial = new ArrayList<>();




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
