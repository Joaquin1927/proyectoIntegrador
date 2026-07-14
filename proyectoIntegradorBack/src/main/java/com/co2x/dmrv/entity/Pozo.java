package com.co2x.dmrv.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "pozo")
public class Pozo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nombre;

    @ManyToOne
    @JoinColumn(name = "planta_id")
    private Planta planta;
}
