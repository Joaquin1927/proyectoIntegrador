package com.co2x.dmrv.dto;

import com.co2x.dmrv.model.Rol;

public class RegisterRequestDTO {
    private String email;
    private String nombre;
    private String password;
    private Rol rol;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }
}