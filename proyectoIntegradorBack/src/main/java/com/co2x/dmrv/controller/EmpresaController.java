package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.EmpresaDTO;
import com.co2x.dmrv.service.EmpresaService;
import jakarta.validation.Valid;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/empresas")
public class EmpresaController {
    private final EmpresaService empresaService;
    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }
    @GetMapping
    public List<EmpresaDTO> listar() {
        return empresaService.listar();
    }

   // @PostMapping
   // public EmpresaDTO crear(@RequestBody EmpresaDTO dto) {
   //     System.out.println("DTO EMPRESA RECIBIDO: " + dto);
   //     return empresaService.crear(dto);
   // }

    @PostMapping
    public EmpresaDTO crear(@Valid @RequestBody EmpresaDTO dto) {
        System.out.println("AUTH: " + SecurityContextHolder.getContext().getAuthentication());
        System.out.println("DTO EMPRESA RECIBIDO: " + dto);
        return empresaService.crear(dto);
    }


}
