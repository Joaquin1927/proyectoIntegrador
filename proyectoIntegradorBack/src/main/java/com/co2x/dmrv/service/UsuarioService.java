package com.co2x.dmrv.service;

import com.co2x.dmrv.model.Usuario;
import com.co2x.dmrv.model.Rol;
import com.co2x.dmrv.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario login(String email, String nombre, Rol rol) {
        return usuarioRepository.findById(email)
                .orElseGet(() -> {
                    Usuario nuevo = new Usuario(email, nombre, rol);
                    return usuarioRepository.save(nuevo);
                });
    }

    public Usuario obtenerUsuario(String id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}