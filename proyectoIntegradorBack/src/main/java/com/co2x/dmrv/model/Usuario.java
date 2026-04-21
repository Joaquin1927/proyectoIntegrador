package com.co2x.dmrv.model;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    private String id; // email como identificador único

    private String nombre;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    private boolean activo = true;

    // ===== Constructores =====

    public Usuario() {
    }

    public Usuario(String id, String nombre, Rol rol) {
        this.id = id;
        this.nombre = nombre;
        this.rol = rol;
    }

    // ===== Getters y Setters =====

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

package com.co2x.dmrv.model;

public enum Rol {
    EMPLEADO,
    AUDITOR,
    ADMIN
}