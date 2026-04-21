package com.co2x.dmrv.repository;

import com.co2x.dmrv.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    boolean existsByIdAndActivoTrue(String id);
}