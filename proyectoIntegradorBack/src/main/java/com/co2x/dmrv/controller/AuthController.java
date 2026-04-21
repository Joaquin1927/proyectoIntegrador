package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.LoginRequestDTO;
import com.co2x.dmrv.dto.UsuarioDTO;
import com.co2x.dmrv.model.Rol;
import com.co2x.dmrv.model.Usuario;
import com.co2x.dmrv.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public UsuarioDTO login(@RequestBody LoginRequestDTO request) {
        Usuario usuario = usuarioService.login(
                request.getEmail(),
                request.getNombre(),
                Rol.valueOf(request.getRol().toUpperCase())
        );

        return new UsuarioDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getRol()
        );
    }
}