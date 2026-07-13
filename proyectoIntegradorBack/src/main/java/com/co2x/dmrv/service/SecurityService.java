package com.co2x.dmrv.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

@Service
public class SecurityService {

    public String getCurrentUserEmail() {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (auth instanceof JwtAuthenticationToken jwtAuth) {

            Jwt jwt = jwtAuth.getToken();

            String email =
                    jwt.getClaimAsString(
                            "preferred_username"
                    );

            if (email == null || email.isBlank())
                email = jwt.getClaimAsString("email");

            if (email == null || email.isBlank())
                email = jwt.getClaimAsString("upn");

            if (email == null || email.isBlank())
                email = jwt.getSubject();

            return email;
        }

        throw new AccessDeniedException(
                "Usuario no autenticado"
        );
    }

    public void validarAuditor() {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (auth == null) {

            throw new AccessDeniedException(
                    "Usuario no autenticado"
            );
        }

        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) {

            throw new AccessDeniedException(
                    "Usuario no autenticado"
            );
        }

        Jwt jwt = jwtAuth.getToken();

        List<String> roles =
                jwt.getClaimAsStringList(
                        "roles"
                );

        if (
                roles == null
                        ||
                        roles.stream()
                                .noneMatch(
                                        r -> r.equalsIgnoreCase(
                                                "AUDITOR"
                                        )
                                )
        ) {

            throw new AccessDeniedException(
                    "Acceso solo para auditores"
            );
        }
    }

    public boolean esAuditor() {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) {
            return false;
        }

        Jwt jwt = jwtAuth.getToken();

        List<String> roles =
                jwt.getClaimAsStringList(
                        "roles"
                );

        return roles != null
                &&
                roles.stream()
                        .anyMatch(
                                r -> r.equalsIgnoreCase(
                                        "AUDITOR"
                                )
                        );
    }

    public boolean esAdmin() {
        return tieneRol("ADMIN");
    }

    private boolean tieneRol(String rol) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) return false;
        List<String> roles = jwtAuth.getToken().getClaimAsStringList("roles");
        return roles != null && roles.stream().anyMatch(r -> r.equalsIgnoreCase(rol));
    }

    public void validarPropietarioOPrivilegiado(String propietario) {
        if (esAdmin() || esAuditor()) return;
        validarPropietario(propietario);
    }

    public void validarUsuarioSolicitado(String usuario) {
        if (esAdmin()) return;
        String actual = getCurrentUserEmail();
        if (usuario == null || !actual.equalsIgnoreCase(usuario)) {
            throw new AccessDeniedException("No puede consultar información de otro usuario");
        }
    }

    public void validarPropietario(
            String propietario
    ) {

        String usuarioActual =
                getCurrentUserEmail();

        if (
                propietario == null
                        ||
                        !usuarioActual.equalsIgnoreCase(
                                propietario
                        )
        ) {

            throw new AccessDeniedException(
                    "Acceso denegado"
            );
        }
    }

}
