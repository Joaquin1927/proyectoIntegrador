package com.co2x.dmrv.dto;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class NotificacionDTO {

    Integer id;
    String mensaje;
    Integer paqueteId;
    boolean leido;
    LocalDateTime fecha;

}
