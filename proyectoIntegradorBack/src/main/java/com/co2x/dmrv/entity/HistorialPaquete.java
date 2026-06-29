package com.co2x.dmrv.entity;

import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_paquete")
@Data
public class HistorialPaquete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "paquete_id")
    private PaqueteCO2 paquete;

    private String editor;

    @Enumerated(EnumType.STRING)
    private EstadoPaquete accion;


    @Column(columnDefinition = "text")
    private String cambios;

    private LocalDateTime fecha = LocalDateTime.now();

    private String snapshot;




}
