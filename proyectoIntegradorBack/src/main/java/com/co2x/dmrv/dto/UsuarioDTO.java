package com.co2x.dmrv.dto;

import com.co2x.dmrv.entity.Rol;

public class UsuarioDTO {

    private String id;
    private String nombre;
    private Rol rol;

    public UsuarioDTO() {}

    public UsuarioDTO(String id, String nombre, Rol rol) {
        this.id = id;
        this.nombre = nombre;
        this.rol = rol;
    }

    // getters y setters
}