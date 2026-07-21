package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.PlantaDTO;
import com.co2x.dmrv.service.PlantaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/plantas")
public class PlantaController {
    @Autowired
    private PlantaService plantaService;
    @GetMapping
    public List<PlantaDTO> listar() {
        return plantaService.listar();
    }
    @PostMapping(
            consumes = {"multipart/form-data"}
    )
    public PlantaDTO crear(
            @RequestPart("data") PlantaDTO dto,
            @RequestPart("pdf") MultipartFile pdf
    ) throws IOException {
        System.out.println("=== ENTRE AL CONTROLLER DE PLANTA ===");
        System.out.println("=== CREAR PLANTA ===");
        System.out.println("DTO: " + dto);
        if (pdf == null || pdf.isEmpty()) {
            throw new RuntimeException(
                    "PDF técnico obligatorio"
            );
        }
        String filename =
                UUID.randomUUID()
                        + "_"
                        + pdf.getOriginalFilename();
        Path path =
                Paths.get(
                        "uploads",
                        filename
                );
        Files.createDirectories(
                path.getParent()
        );
        Files.write(
                path,
                pdf.getBytes()
        );
        dto.setPdfTecnico(
                filename
        );
        return plantaService.crear(
                dto
        );
    }

    @GetMapping("/byEmpresa/{id}")
    public List<PlantaDTO> listarPorEmpresa(@PathVariable Integer id) {
        return plantaService.listarPorEmpresa(id);
    }
}