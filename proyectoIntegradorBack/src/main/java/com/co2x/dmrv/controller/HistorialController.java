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


import java.nio.file.AccessDeniedException;
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
    public ResponseEntity<List<HistorialPaqueteDTO>> historial(@PathVariable Integer id) throws AccessDeniedException {

        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paquete no encontrado"));

        // 🔥 Permitir acceso a cualquier auditor del frontend
        String emailActual = securityService.getCurrentUserEmail();
        if (!securityService.esAdmin() && !securityService.esAuditor()) {
            // Si no es admin ni auditor, debe ser propietario
            if (!emailActual.equalsIgnoreCase(paquete.getCreatedBy())) {
                throw new AccessDeniedException("Acceso denegado");
            }
        }

        var historial = historialRepo.findByPaqueteOrderByFechaDesc(paquete)
                .stream()
                .map(factory::toHistorialDTO)
                .toList();

        return ResponseEntity.ok(historial);
    }
}
