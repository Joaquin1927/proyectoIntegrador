package com.co2x.dmrv.dto;

import com.co2x.dmrv.model.Rol;
import jakarta.security.auth.message.AuthStatus;

public class LoginResponseDTO {
    private AuthStatus status;
    private String accessToken;
    private String mfaToken;
    private String email;
    private String nombre;
    private Rol rol;

    public LoginResponseDTO() {
    }

    public LoginResponseDTO(AuthStatus status, String accessToken, String mfaToken,
                            String email, String nombre, Rol rol) {
        this.status = status;
        this.accessToken = accessToken;
        this.mfaToken = mfaToken;
        this.email = email;
        this.nombre = nombre;
        this.rol = rol;
    }

    public AuthStatus getStatus() { return status; }
    public void setStatus(AuthStatus status) { this.status = status; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getMfaToken() { return mfaToken; }
    public void setMfaToken(String mfaToken) { this.mfaToken = mfaToken; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }
}