package com.co2x.dmrv.Test;


import com.co2x.dmrv.service.SecurityService;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;


public class SecurityServiceTest {

    private final SecurityService service =
            new SecurityService();

    @Test
    void deberiaObtenerEmail() {

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim(
                        "preferred_username",
                        "usuario@test.com"
                )
                .build();

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        new JwtAuthenticationToken(jwt)
                );

        String email =
                service.getCurrentUserEmail();

        assertEquals(
                "usuario@test.com",
                email
        );
    }

    @Test
    void deberiaValidarAuditor() {

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim(
                        "preferred_username",
                        "auditor@test.com"
                )
                .claim(
                        "roles",
                        List.of("AUDITOR")
                )
                .build();

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        new JwtAuthenticationToken(jwt)
                );

        assertDoesNotThrow(
                () -> service.validarAuditor()
        );
    }

    @Test
    void deberiaRechazarUsuarioSinRolAuditor() {

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim(
                        "roles",
                        List.of("EMPLEADO")
                )
                .build();

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        new JwtAuthenticationToken(jwt)
                );

        assertThrows(
                RuntimeException.class,
                () -> service.validarAuditor()
        );
    }
    @Test
    void deberiaValidarPropietario() {

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim(
                        "preferred_username",
                        "usuario@test.com"
                )
                .build();

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        new JwtAuthenticationToken(jwt)
                );

        assertDoesNotThrow(
                () -> service.validarPropietario(
                        "usuario@test.com"
                )
        );
    }
    @Test
    void deberiaRechazarPropietarioIncorrecto() {

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim(
                        "preferred_username",
                        "usuario@test.com"
                )
                .build();

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        new JwtAuthenticationToken(jwt)
                );

        assertThrows(
                RuntimeException.class,
                () -> service.validarPropietario(
                        "otro@test.com"
                )
        );
    }
}
