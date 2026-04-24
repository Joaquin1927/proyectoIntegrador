package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.LoginRequestDTO;
import com.co2x.dmrv.dto.RegisterRequestDTO;
import com.co2x.dmrv.dto.UsuarioDTO;
import com.co2x.dmrv.model.Rol;
import com.co2x.dmrv.model.Usuario;
import com.co2x.dmrv.service.SistemaAcceso;
import com.co2x.dmrv.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final SistemaAcceso sistemaAcceso;

    public AuthController(SistemaAcceso sistemaAcceso) {
        this.sistemaAcceso = sistemaAcceso;
    }

    @PostMapping("/register")
    public UsuarioDTO register(@RequestBody RegisterRequestDTO request) {
        Usuario usuario = sistemaAcceso.agregarUsuario(
                request.getEmail(),
                request.getNombre(),
                request.getPassword(),
                request.getRol()
        );

        return new UsuarioDTO(usuario.getId(), usuario.getNombre(), usuario.getRol());
    }

    @PostMapping("/login")
    public UsuarioDTO login(@RequestBody LoginRequestDTO request) {
        Usuario usuario = sistemaAcceso.login(request.getEmail(), request.getPassword());
        return new UsuarioDTO(usuario.getId(), usuario.getNombre(), usuario.getRol());
    }
}