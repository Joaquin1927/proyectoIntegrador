package com.co2x.dmrv.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // ID del usuario en el proveedor IAM (Entra, Keycloak, etc.)
    @Column(unique = true)
    private String externalId;

    private String email;
    private String nombre;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    private boolean activo = true;

    public Usuario() {}

    public Usuario(String externalId, String email, String nombre, Rol rol) {
        this.externalId = externalId;
        this.email = email;
        this.nombre = nombre;
        this.rol = rol;
    }

    // ===== Getters y Setters =====

    public String getId() {
        return id;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}