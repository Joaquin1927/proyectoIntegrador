package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.HistorialPaqueteDTO;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.repository.HistorialPaqueteRepository;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.utils.Factory;
import com.co2x.dmrv.service.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/historial")
public class HistorialController {


    @Autowired
    private HistorialPaqueteRepository historialRepo;

    @Autowired
    private PaqueteCO2Repository paqueteRepo;

    @Autowired
    private Factory factory;

    @Autowired
    private SecurityService securityService;

    @GetMapping("/{id}/getHistorial")
    public ResponseEntity<List<HistorialPaqueteDTO>> historial(@PathVariable Integer id) {

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

        securityService.validarPropietarioOPrivilegiado(paquete.getCreatedBy());

        var historial = historialRepo.findByPaqueteOrderByFechaDesc(paquete)
                .stream()
                .map(factory::toHistorialDTO)
                .toList();

        return ResponseEntity.ok(historial);
    }
}
