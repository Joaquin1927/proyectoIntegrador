package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.NotificacionDTO;
import com.co2x.dmrv.entity.Notificacion;
import com.co2x.dmrv.repository.NotificacionRepository;
import com.co2x.dmrv.service.SecurityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificaciones")
public class NotificacionController {

    private final NotificacionRepository repo;
    private final SecurityService securityService;

    public NotificacionController(NotificacionRepository repo, SecurityService securityService) {
        this.repo = repo;
        this.securityService = securityService;
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
    public List<NotificacionDTO> getNoLeidas(
            @PathVariable("usuario") String usuario) {

        securityService.validarUsuarioSolicitado(usuario);


        var lista = repo.findByUsuarioAndLeidoFalse(usuario);


        lista.forEach(n ->
                System.out.println(
                        n.getId()
                                + " - "
                                + n.getUsuario()
                                + " - "
                                + n.isLeido()
                )
        );

        return lista.stream()
                .map(this::toDTO)
                .toList();
    }






    // 📄 Obtener TODAS (para la página /notificaciones)

    @GetMapping("/{usuario}")
    public List<NotificacionDTO> getTodas(
            @PathVariable("usuario") String usuario) {

        securityService.validarUsuarioSolicitado(usuario);

        System.out.println("USUARIO TODAS: " + usuario);

        return repo.findByUsuario(usuario)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @PostMapping("/leer/{usuario}")
    public void marcarLeidas(@PathVariable String usuario) {

        securityService.validarUsuarioSolicitado(usuario);

        List<Notificacion> lista =
                repo.findByUsuarioAndLeidoFalse(usuario);

        lista.forEach(n -> n.setLeido(true));

        repo.saveAll(lista);
    }







}
