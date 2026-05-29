package com.co2x.dmrv.service;

import com.co2x.dmrv.entity.Usuario;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    public List<Usuario> listar() {
        throw new RuntimeException("Implementar listar()");
    }

    public Usuario crear(Usuario u) {
        throw new RuntimeException("Implementar crear()");
    }

    public Usuario miPerfil() {
        throw new RuntimeException("Implementar miPerfil()");
    }

    public List<String> auditoria() {
        throw new RuntimeException("Implementar auditoria()");
    }
}