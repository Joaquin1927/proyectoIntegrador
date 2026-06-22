package com.co2x.dmrv.entity;

import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
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

    @Column(columnDefinition = "jsonb")
    private String cambios;   // <--- SIEMPRE STRING EN LA ENTIDAD

    private LocalDateTime fecha = LocalDateTime.now();


}
