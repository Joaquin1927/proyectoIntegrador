package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.HistorialPaqueteDTO;
import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.dto.PaqueteEdicionDTO;
import com.co2x.dmrv.repository.HistorialPaqueteRepository;
import com.co2x.dmrv.service.AuditoriaService;
import com.co2x.dmrv.service.PaqueteCO2Service;
import com.co2x.dmrv.utils.Factory;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/paquetes")
public class PaqueteController {












    @GetMapping("/usuario/{email}")
    public List<PaqueteCO2DTO> listarPorUsuario(
            @PathVariable("email") String email) {

        return paqueteService.listarPorUsuario(email);
    }









    @Autowired
    private HistorialPaqueteRepository historialRepo;

    @Autowired
    private Factory factory;

    @Autowired
    private PaqueteCO2Service paqueteService;


    @Autowired
    private AuditoriaService auditoriaService;

    @GetMapping("/pendientes")
    public List<PaqueteCO2DTO> pendientes() {
        return paqueteService.listarPendientes();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody PaqueteCO2DTO dto) {
        try {
            System.out.println("ENTRO AL CONTROLLER");


            System.out.println("DTO recibido: " + dto);
            System.out.println("Planta: " + dto.planta);
            System.out.println("Metadata: " + dto.metadata);

            if (dto.planta == null) {
                return ResponseEntity.badRequest().body("Seleccione una planta");
            }

            PaqueteCO2DTO creado = paqueteService.crear(dto);

            return ResponseEntity.ok(creado);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }









    @GetMapping
    public ResponseEntity<List<PaqueteCO2DTO>> listar() {
        return ResponseEntity.ok(paqueteService.listar());
    }


    @GetMapping("/{id}")
    public ResponseEntity<PaqueteCO2DTO> obtener(
            @PathVariable("id") Integer id) {

        System.out.println("BUSCANDO PAQUETE ID = " + id);

        return ResponseEntity.ok(
                paqueteService.obtenerPorId(id)
        );
    }








    @GetMapping("/{id}/historial/ultimo")
    public ResponseEntity<?> getUltimoHistorial(@PathVariable Integer id) {

        return historialRepo.findTopByPaqueteIdOrderByFechaDesc(id)
                .map(h -> ResponseEntity.ok(factory.toHistorialDTO(h)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }




    @GetMapping("/debug-auth")
    public String debug() {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return String.valueOf(auth);
    }


    @GetMapping("/{id}/edicion")
    public ResponseEntity<PaqueteEdicionDTO> getEdicion(
            @PathVariable Integer id
    ) {

        System.out.println("ENTRO A GET EDICION");

        return ResponseEntity.ok(
                paqueteService.getPaqueteParaEdicion(id)
        );
    }




    @PutMapping("/{id}/corregir")
    public ResponseEntity<?> corregir(
            @PathVariable Integer id,
            @RequestBody PaqueteEdicionDTO dto
    ) {

        paqueteService.corregirPaquete(
                id,
                dto
        );

        return ResponseEntity.ok().build();
    }

//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
//        paqueteService.eliminar(id);
//        return ResponseEntity.noContent().build();
//    }


}
