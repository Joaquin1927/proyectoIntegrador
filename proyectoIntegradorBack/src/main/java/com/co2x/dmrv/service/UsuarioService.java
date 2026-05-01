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

    public Usuario obtenerOCrearUsuario(String idKeycloak, String email, String nombre, Rol rol) {
        return usuarioRepository.findByIdKeycloak(idKeycloak)
                .map(usuario -> {
                    usuario.setEmail(email);
                    usuario.setNombre(nombre);
                    usuario.setRol(rol);
                    return usuarioRepository.save(usuario);
                })
                .orElseGet(() -> {
                    Usuario nuevo = new Usuario(idKeycloak, email, nombre, rol);
                    return usuarioRepository.save(nuevo);
                });
    }
}