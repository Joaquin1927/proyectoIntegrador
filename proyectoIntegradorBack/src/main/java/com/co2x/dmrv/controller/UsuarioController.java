package com.co2x.dmrv.controller;

import com.co2x.dmrv.model.Usuario;
import com.co2x.dmrv.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService servicio;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Usuario> listarTodos() {
        return servicio.listar();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Usuario crear(@RequestBody Usuario u) {
        return servicio.crear(u);
    }

    @GetMapping("/perfil")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO','AUDITOR')")
    public Usuario miPerfil() {
        return servicio.miPerfil();
    }

    @GetMapping("/test")
    public String test() {
        return "Backend funcionando";
    }

    @GetMapping("/auditoria")
    @PreAuthorize("hasRole('AUDITOR')")
    public List<String> verAuditoria() {
        return servicio.auditoria();
    }
}