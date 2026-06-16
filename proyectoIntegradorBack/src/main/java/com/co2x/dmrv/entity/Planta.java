package com.co2x.dmrv.entity;

import com.co2x.dmrv.dto.PlantaDTO;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Reporte;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Data
@Entity
@Table(name = "Planta")
public class Planta extends PlantaDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "latitud")
    private Double latitud;

    @Column(name = "longitud")
    private Double longitud;

    // ✅ RELACIÓN CON EMPRESA (ESTA FALTABA)
    @ManyToOne
    @JoinColumn(name = "empresa")
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
