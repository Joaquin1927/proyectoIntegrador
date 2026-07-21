package com.co2x.dmrv.repository;

import com.co2x.dmrv.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {

    List<Notificacion> findByUsuario(String usuario);

    List<Notificacion> findByUsuarioAndLeidoFalse(String usuario);

    List<Notificacion> findByUsuarioOrderByFechaDesc(
            String usuario
    );
}
