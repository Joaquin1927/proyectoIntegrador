package com.co2x.dmrv.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Entity
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fechaCaptura;
    private Double toneladasCO2;
    private String locacion;

    @OneToMany(mappedBy = "reporte")
    private List<PaqueteCO2> paquetes;

}
