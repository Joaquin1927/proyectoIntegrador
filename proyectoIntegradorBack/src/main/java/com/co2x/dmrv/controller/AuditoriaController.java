package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.PaqueteEdicionDTO;
import com.co2x.dmrv.service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

    @RestController
    @RequestMapping("/auditoria")
    public class AuditoriaController {

        @Autowired
        private AuditoriaService auditoriaService;

        @PostMapping("/{id}/aprobar")
        public ResponseEntity<?> aprobar(
                @PathVariable Integer id) {

            return ResponseEntity.ok(
                    auditoriaService.aprobar(id)
            );
        }

        @PostMapping("/{id}/rechazar")
        public ResponseEntity<?> rechazar(
                @PathVariable Integer id) {

            return ResponseEntity.ok(
                    auditoriaService.rechazar(id)
            );
        }

        @PostMapping("/{id}/correccion")
        public ResponseEntity<?> solicitarCorreccion(
                @PathVariable Integer id,
                @RequestBody Map<String,Object> body
        ) {

            auditoriaService.solicitarCorreccion(
                    id,
                    body
            );

            return ResponseEntity.ok().build();
        }
        @GetMapping("/{id}/edicion")
        public ResponseEntity<PaqueteEdicionDTO> getEdicion(
                @PathVariable Integer id
        ) {

            return ResponseEntity.ok(
                    auditoriaService.getPaqueteParaEdicion(id)
            );
        }

    }

