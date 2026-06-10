package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.service.PaqueteCO2Service;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/paquetes")
public class PaqueteController {

    @Autowired
    private PaqueteCO2Service service;
    @GetMapping("/pendientes")
    public List<PaqueteCO2DTO> pendientes() {
        return service.listarPendientes();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody PaqueteCO2DTO dto) {
        try {
            System.out.println("ENTRO AL CONTROLLER");
            System.out.println(dto.plantaId);

            if (dto.plantaId == null) {
                return ResponseEntity.badRequest().body("Seleccione una planta");
            }

            PaqueteCO2DTO creado = service.crear(dto);

            return ResponseEntity.ok(creado);

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 CLAVE
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    @GetMapping("/usuario/{email}")
    public List<PaqueteCO2DTO> listarPorUsuario(
            @PathVariable String email) {
        return service.listarPorUsuario(email);
    }
    @GetMapping
    public ResponseEntity<List<PaqueteCO2DTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaqueteCO2DTO> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
//        service.eliminar(id);
//        return ResponseEntity.noContent().build();
//    }
}
