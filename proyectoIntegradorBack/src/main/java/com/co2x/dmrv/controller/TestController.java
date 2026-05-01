package com.co2x.dmrv.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class restController {

    @GetMapping("/public")
    public String publico() {
        return "Endpoint público";
    }

    @GetMapping("/privado")
    public String privado() {
        return "Endpoint privado";
    }
}