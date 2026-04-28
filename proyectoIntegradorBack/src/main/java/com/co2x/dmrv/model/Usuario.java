package com.co2x.dmrv.model;

import jakarta.persistence.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    private String id; // email como identificador único

    private String nombre;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    private boolean activo = true;

    private boolean mfaEnabled;
    @Enumerated(EnumType.STRING)
    private MFAMethod mfaMethod = MFAMethod.NONE; //mas adelante implementaremos la funcion que cambie el valor de este atributo
    private String totpSecret;
    private boolean totpSetupConfirmed;

    public Usuario(String email, String nombre, Rol rol) {
    }

    public boolean validarPassword(String password, PasswordEncoder encoder) {
        return encoder.matches(password, this.passwordHash);
    }

    public Usuario() {
    }

    public Usuario(String id, String nombre, String passwordHash, Rol rol) {
        this.id = id;
        this.nombre = nombre;
        this.passwordHash = passwordHash;
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
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

