package com.co2x.dmrv.service;

import com.co2x.dmrv.model.Rol;
import com.co2x.dmrv.model.Usuario;
import com.co2x.dmrv.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SistemaAcceso {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public SistemaAcceso(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario login(String usr, String pwd) {
        Usuario usuario = usuarioRepository.findById(usr)
                .orElseThrow(() -> new RuntimeException("Credenciales invalidas"));

        if (!usuario.isActivo()) {
            throw new RuntimeException("Usuario inactivo");
        }

        if (!usuario.validarPassword(pwd, passwordEncoder)) {
            throw new RuntimeException("Credenciales invalidas");
        }

        return usuario;
    }

    public Usuario agregarUsuario(String email, String nombre, String password, Rol rol) {
        if (usuarioRepository.existsById(email)) {
            throw new RuntimeException("El usuario ya existe");
        }

        Usuario usuario = new Usuario(email, nombre, passwordEncoder.encode(password), rol);
        return usuarioRepository.save(usuario);
    }
}
