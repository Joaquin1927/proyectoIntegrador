package com.co2x.dmrv.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.*;
import java.util.stream.Collectors;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/auth/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/paquetes/**")
                        .hasAnyRole("EMPLEADO", "ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/paquetes/**")
                        .hasAnyRole("AUDITOR", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/dashboard/**")
                        .hasAnyRole("EMPLEADO", "AUDITOR", "ADMIN")

                        .anyRequest().authenticated()
                )

                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthConverter()) // 🔥 conectar acá
                        )
                );

        return http.build();
    }

    @Bean
    public Converter<Jwt, AbstractAuthenticationToken> jwtAuthConverter() {
        return new Converter<Jwt, AbstractAuthenticationToken>() {
            @Override
            public AbstractAuthenticationToken convert(Jwt jwt) {

                Map<String, Object> realmAccess = jwt.getClaim("realm_access");

                if (realmAccess == null || realmAccess.get("roles") == null) {
                    return new JwtAuthenticationToken(jwt, Collections.emptyList());
                }

                Collection<String> roles = (Collection<String>) realmAccess.get("roles");

                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> "ROLE_" + role)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                return new JwtAuthenticationToken(jwt, authorities);
            }
        };
    }
}