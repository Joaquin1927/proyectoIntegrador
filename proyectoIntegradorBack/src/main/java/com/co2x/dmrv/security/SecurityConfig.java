package com.co2x.dmrv.security;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
<<<<<<< HEAD
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
=======
                // CORS moderno (Spring Security 6)
                .cors(cors -> {})

                // desactivar CSRF (API REST)
                .csrf(csrf -> csrf.disable())

                // sin sesiones
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // por ahora todo permitido (podés restringir después)
>>>>>>> develop
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/test").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 ->
<<<<<<< HEAD
                        oauth2.jwt(jwt -> {})
=======
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)
                        )
>>>>>>> develop
                );

        return http.build();
    }
<<<<<<< HEAD
}
=======

    // CONFIGURACIÓN GLOBAL DE CORS (ESTO ARREGLA TU ERROR)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
>>>>>>> develop
