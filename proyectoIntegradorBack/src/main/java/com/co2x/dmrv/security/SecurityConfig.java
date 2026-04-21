package com.co2x.dmrv.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // Endpoints públicos
                        .requestMatchers("/auth/**").permitAll()

                        // Empleado
                        .requestMatchers(HttpMethod.POST, "/paquetes/**")
                        .hasAnyRole("EMPLEADO", "ADMIN")

                        // Auditor
                        .requestMatchers(HttpMethod.PUT, "/paquetes/**")
                        .hasAnyRole("AUDITOR", "ADMIN")

                        // Dashboard / consultas
                        .requestMatchers(HttpMethod.GET, "/dashboard/**")
                        .hasAnyRole("EMPLEADO", "AUDITOR", "ADMIN")

                        // Todo lo demás requiere autenticación
                        .anyRequest().authenticated()
                )
                .httpBasic();

        return http.build();
    }
}