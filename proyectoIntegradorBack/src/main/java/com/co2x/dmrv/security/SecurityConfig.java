package com.co2x.dmrv.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    static {
        System.out.println("SECURITYCONFIG CARGADA");
    }

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("SECURITY CONFIG NUEVA CARGADA");
        System.out.println("SECURITY FILTER CHAIN CREADA");
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/test/health", "/test/publico").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auditoria/**").hasRole("AUDITOR")
                        .requestMatchers(HttpMethod.GET, "/paquetes/pendientes").hasRole("AUDITOR")
                        .requestMatchers(HttpMethod.POST, "/paquetes/*/mint").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/paquetes/aprobados").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/paquetes").hasRole("EMPLEADO")
                        .anyRequest().authenticated()
                ).oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        System.out.println("CORS CONFIG CARGADA");

        CorsConfiguration config = new CorsConfiguration();

        List<String> allowedOrigins = Arrays.stream(frontendUrl.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();

        config.setAllowedOrigins(allowedOrigins);

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;

    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles == null) return List.of();
            return roles.stream()
                    .<GrantedAuthority>map(role ->
                            new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    .toList();
        });
        return converter;
    }
}
