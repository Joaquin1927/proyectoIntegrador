package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.HistorialPaqueteDTO;
import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.dto.PaqueteEdicionDTO;
import com.co2x.dmrv.repository.HistorialPaqueteRepository;
import com.co2x.dmrv.service.PaqueteCO2Service;
import com.co2x.dmrv.utils.Factory;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/paquetes")
public class PaqueteController {
    @Autowired
    private HistorialPaqueteRepository historialRepo;

    @Autowired
    private Factory factory;
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
            //System.out.println(dto.plantaId);


            System.out.println("DTO recibido: " + dto);
            System.out.println("Planta: " + dto.planta);
            System.out.println("Metadata: " + dto.metadata);

            if (dto.planta == null) {
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


    @PostMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobar(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.aprobar(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }


    @PostMapping("/{id}/rechazar")
    public ResponseEntity<PaqueteCO2DTO> rechazar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.rechazar(id));
    }


    @PostMapping("/{id}/correccion")
    public ResponseEntity<?> solicitarCorreccion(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {

        service.solicitarCorreccion(id, body);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/historial/ultimo")
    public ResponseEntity<?> getUltimoHistorial(@PathVariable Integer id) {

        return historialRepo.findTopByPaqueteIdOrderByFechaDesc(id)
                .map(h -> ResponseEntity.ok(factory.toHistorialDTO(h)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }


    @GetMapping("/{id}/edicion")
    public ResponseEntity<PaqueteEdicionDTO> getEdicion(
            @PathVariable Integer id
    ) {

        return ResponseEntity.ok(
                service.getPaqueteParaEdicion(id)
        );
    }



//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
//        service.eliminar(id);
//        return ResponseEntity.noContent().build();
//    }


}
