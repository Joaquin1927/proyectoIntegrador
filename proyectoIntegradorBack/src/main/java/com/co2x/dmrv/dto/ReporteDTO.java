package com.co2x.dmrv.dto;

import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.entity.Usuario;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

public class ReporteDTO {
        private Integer id;
        private LocalDate fechaReporte;
        private Double toneladasCO2;
        private String ubicacion;
        private String tipoCaptura;
        private String metodologia;
        private String estado;
        private String observaciones;
        private String usuarioResponsable;
        private Usuario empleado;
        private Planta planta;
        private List<PaqueteCO2> paquetes;
    }
