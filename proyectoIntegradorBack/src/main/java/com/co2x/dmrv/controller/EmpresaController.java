package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.EmpresaDTO;
import com.co2x.dmrv.service.EmpresaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
}
