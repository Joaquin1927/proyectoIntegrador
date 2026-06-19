package com.co2x.dmrv.repository;

import com.co2x.dmrv.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByExternalId(String externalId);

    Optional<Object> findByEmail(String auditor);

    //static Optional<Usuario> findByEmail(String email);

}