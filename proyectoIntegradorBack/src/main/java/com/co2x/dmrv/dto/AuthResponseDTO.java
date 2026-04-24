package com.co2x.dmrv.dto;

import com.co2x.dmrv.model.Rol;

public class AuthResponseDTO {
    private String token;
    private String email;
    private String nombre;
    private Rol rol;

    public AuthResponseDTO(String token, String email, String nombre, Rol rol) {
        this.token = token;
        this.email = email;
        this.nombre = nombre;
        this.rol = rol;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getNombre() { return nombre; }
    public Rol getRol() { return rol; }
}