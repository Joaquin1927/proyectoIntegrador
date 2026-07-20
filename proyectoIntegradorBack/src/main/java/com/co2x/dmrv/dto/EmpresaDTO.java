package com.co2x.dmrv.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmpresaDTO {
    private Integer id;
    @NotBlank
    private String nombre;
    @NotBlank
    private String numeroCorporacion;
    @NotBlank
    private String numeroEmpresa;
    @NotBlank
    private String direccion;
    @NotBlank
    private String directores;
    @NotBlank
    private String contacto;
}


