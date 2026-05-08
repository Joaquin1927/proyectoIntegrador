package com.co2x.dmrv.repository;

import com.co2x.dmrv.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    Optional<Usuario> findByExternalId(String externalId);

    Optional<Usuario> findByEmail(String email);
}