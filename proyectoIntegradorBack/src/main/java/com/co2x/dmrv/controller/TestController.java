package com.co2x.dmrv.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.co2x.dmrv.service.IpfsService;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private IpfsService ipfsService;

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

    @GetMapping("/ipfs-test")
    public String testIpfs() {
        String json = "{\"test\":\"hola IPFS\"}";
        return ipfsService.uploadJSON(json);
    }
}