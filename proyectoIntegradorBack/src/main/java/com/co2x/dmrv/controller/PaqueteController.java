package com.co2x.dmrv.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/paquetes")
public class PaqueteController {
    @GetMapping
    public String listar() {
        return "Listado de paquetes";
    }

    @PostMapping
    public String crear() {
        return "Paquete creado";
    }

    // post para crear un paquete, agregarle una ruta y procesar JSON.
    // buscar que java tiene funciones reservadas ya para procesarlo
    // De aca se llama a un dto
}
