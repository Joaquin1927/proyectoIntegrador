package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.HistorialPaqueteDTO;
import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.dto.PaqueteEdicionDTO;
import com.co2x.dmrv.dto.MintResultDTO;
import com.co2x.dmrv.repository.HistorialPaqueteRepository;
import com.co2x.dmrv.service.MintingService;
import com.co2x.dmrv.service.AuditoriaService;
import com.co2x.dmrv.service.PaqueteCO2Service;
import com.co2x.dmrv.utils.Factory;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import com.co2x.dmrv.entity.EstadoPaquete;

@RestController
@RequestMapping("/paquetes")
public class PaqueteController {












    @GetMapping("/usuario/{email}")
    @PreAuthorize("hasAnyRole('EMPLEADO','AUDITOR','ADMIN')")
    public ResponseEntity<?> listarPorUsuario(
            @PathVariable String email) {

        System.out.println("EMAIL RECIBIDO: " + email);

        try {

            var paquetes =
                    paqueteService.listarPorUsuario(email);

            System.out.println(
                    "PAQUETES ENCONTRADOS: "
                            + paquetes.size());

            return ResponseEntity.ok(paquetes);

        } catch (Exception e) {

            System.out.println("ERROR LISTAR USUARIO");

            e.printStackTrace();

            throw e;
        }
    }









    @Autowired
    private HistorialPaqueteRepository historialRepo;

    @Autowired
    private MintingService mintingService;

    @Autowired
    private Factory factory;

    @Autowired
    private PaqueteCO2Service paqueteService;


    @Autowired
    private AuditoriaService auditoriaService;

    @GetMapping("/pendientes")
    @PreAuthorize("hasRole('AUDITOR')")
    public List<PaqueteCO2DTO> pendientes() {
        return paqueteService.listarPendientes();
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLEADO')")
    public ResponseEntity<PaqueteCO2DTO> crear(@Valid @RequestBody PaqueteCO2DTO dto)
            throws JsonProcessingException {
        return ResponseEntity.ok(paqueteService.crear(dto));
    }









    @GetMapping
    @PreAuthorize("hasAnyRole('AUDITOR','ADMIN')")
    public ResponseEntity<List<PaqueteCO2DTO>> listar() {
        return ResponseEntity.ok(paqueteService.listar());
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('EMPLEADO','AUDITOR','ADMIN')")
    public List<PaqueteCO2DTO> buscar(
            @RequestParam(required = false) Integer id,
            @RequestParam(required = false) LocalDate fechaDesde,
            @RequestParam(required = false) LocalDate fechaHasta,
            @RequestParam(required = false) Integer plantaId,
            @RequestParam(required = false) EstadoPaquete estado,
            @RequestParam(required = false) String tipoProyecto) {
        return paqueteService.buscar(
                id, fechaDesde, fechaHasta, plantaId, estado, tipoProyecto
        );
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLEADO','AUDITOR','ADMIN')")
    public ResponseEntity<PaqueteCO2DTO> obtener(
            @PathVariable("id") Integer id) {

        System.out.println("BUSCANDO PAQUETE ID = " + id);

        return ResponseEntity.ok(
                paqueteService.obtenerPorId(id)
        );
    }








    @GetMapping("/{id}/historial/ultimo")
    @PreAuthorize("hasAnyRole('EMPLEADO','AUDITOR','ADMIN')")
    public ResponseEntity<?> getUltimoHistorial(@PathVariable Integer id) {

        paqueteService.validarAccesoPaquete(id);

        return historialRepo.findTopByPaqueteIdOrderByFechaDesc(id)
                .map(h -> ResponseEntity.ok(factory.toHistorialDTO(h)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }




    @GetMapping("/{id}/edicion")
    @PreAuthorize("hasRole('EMPLEADO')")
    public ResponseEntity<PaqueteEdicionDTO> getEdicion(
            @PathVariable Integer id
    ) {

        System.out.println("ENTRO A GET EDICION");

        return ResponseEntity.ok(
                paqueteService.getPaqueteParaEdicion(id)
        );
    }

    @PostMapping("/{id}/mint")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MintResultDTO> mintear(@PathVariable Integer id) {

        return ResponseEntity.ok(mintingService.mintearPaquete(id));
    }

    @GetMapping("/aprobados")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PaqueteCO2DTO> aprobados() {

        System.out.println("ENTRO A APROBADOS");

        return paqueteService.listarAprobados();
    }


    @PutMapping("/{id}/corregir")
    @PreAuthorize("hasRole('EMPLEADO')")
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
