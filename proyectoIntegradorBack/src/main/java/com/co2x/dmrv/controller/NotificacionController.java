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

    // 🔔 Obtener solo NO leídas (para el Header)
    @GetMapping("/noleidas/{usuario}")
    public List<NotificacionDTO> getNoLeidas(@PathVariable String usuario) {
        return repo.findByUsuarioAndLeidoFalse(usuario)
                .stream()
                .map(this::toDTO)
                .toList();
    }




    // 📄 Obtener TODAS (para la página /notificaciones)
    @GetMapping("/{usuario}")
    public List<NotificacionDTO> getTodas(@PathVariable String usuario) {
        return repo.findByUsuario(usuario)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // ✔️ Marcar todas como leídas
    @PostMapping("/leer/{usuario}")
    public void marcarLeidas(@PathVariable String usuario) {
        List<Notificacion> lista = repo.findByUsuarioAndLeidoFalse(usuario);
        lista.forEach(n -> n.setLeido(true));
        System.out.println("set leido");
        repo.saveAll(lista);
    }







}
