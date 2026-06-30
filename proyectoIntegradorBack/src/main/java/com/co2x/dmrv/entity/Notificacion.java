package com.co2x.dmrv.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String usuario;

    private String mensaje;

    private boolean leido;

    private LocalDateTime fecha;

    private Integer paqueteId;
}
