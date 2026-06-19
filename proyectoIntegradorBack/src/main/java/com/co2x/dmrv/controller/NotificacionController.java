package com.co2x.dmrv.controller;

import com.co2x.dmrv.entity.Notificacion;
import com.co2x.dmrv.repository.NotificacionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificaciones")
public class NotificacionController {

    private final NotificacionRepository repo;

    public NotificacionController(NotificacionRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/{usuario}")
    public List<Notificacion> obtener(@PathVariable String usuario) {
        return repo.findByUsuario(usuario);
    }
}