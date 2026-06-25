package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.NotificacionDTO;
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


    private NotificacionDTO toDTO(Notificacion n) {

        NotificacionDTO dto = new NotificacionDTO();

        dto.setId(n.getId());
        dto.setMensaje(n.getMensaje());
        dto.setPaqueteId(n.getPaqueteId());
        dto.setLeido(n.isLeido());
        dto.setFecha(n.getFecha());

        return dto;
    }


    @GetMapping("/{usuario}")
    public List<NotificacionDTO> getNotificaciones(@PathVariable String usuario) {

        return repo.findByUsuario(usuario)
                .stream()
                .map(this::toDTO)
                .toList();
    }



}