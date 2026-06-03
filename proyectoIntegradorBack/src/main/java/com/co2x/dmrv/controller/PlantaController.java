package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.PlantaDTO;
import com.co2x.dmrv.service.PlantaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plantas")
public class PlantaController {

    @Autowired
    private PlantaService plantaService;

    @GetMapping
    public List<PlantaDTO> listar() {
        return plantaService.listar();
    }
}