package com.co2x.dmrv.dto;

import com.co2x.dmrv.entity.EstadoPaquete;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HistorialPaqueteDTO {

    private Integer id;
    private Integer paqueteId;
    private String editor;
    private EstadoPaquete accion;
    private Object cambios;
    private LocalDateTime fecha;
}