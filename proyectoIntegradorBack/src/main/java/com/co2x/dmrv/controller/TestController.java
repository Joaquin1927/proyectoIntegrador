package com.co2x.dmrv.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/publico")
    public String publico() {
        return "Endpoint público";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String admin() {
        return "Hola Admin";
    }

    @GetMapping("/empleado")
    @PreAuthorize("hasRole('EMPLEADO')")
    public String empleado() {
        return "Hola Empleado";
    }

    @GetMapping("/auditor")
    @PreAuthorize("hasRole('AUDITOR')")
    public String auditor() {
        return "Hola Auditor";
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/health")
    public String health() {
        return "OK";
    }

}