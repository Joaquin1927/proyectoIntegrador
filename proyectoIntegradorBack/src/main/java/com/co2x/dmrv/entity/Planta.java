package com.co2x.dmrv.entity;

import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Reporte;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Data
@Entity
@Table(name = "\"Planta\"")
public class Planta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"Id\"")
    private Integer id;

    @Column(name = "\"Nombre\"")
    private String nombre;

    @Column(name = "\"Direccion\"")
    private String direccion;

    @Column(name = "\"Latitud\"")
    private Double latitud;

    @Column(name = "\"Longitud\"")
    private Double longitud;

    // ✅ RELACIÓN CON EMPRESA (ESTA FALTABA)
    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    // =========================
    // Relaciones
    // =========================

    @JsonIgnore
    @OneToMany(mappedBy = "planta")
    private List<PaqueteCO2> paquetesCO2;

    @JsonIgnore
    @OneToMany(mappedBy = "planta")
    private List<Reporte> reportes;
}
