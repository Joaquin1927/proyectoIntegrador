package com.co2x.dmrv.service.observer;

import com.co2x.dmrv.entity.Notificacion;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.repository.NotificacionRepository;
import org.springframework.stereotype.Component;

@Component
public class NotificacionObserver implements PaqueteObserver {

    private final NotificacionRepository repo;

    public NotificacionObserver(NotificacionRepository repo) {
        this.repo = repo;
    }

    @Override
    public void update(PaqueteCO2 paquete) {

        Notificacion n = new Notificacion();

        n.setUsuario(paquete.getCreatedBy());
        n.setPaqueteId(paquete.getId());

        n.setMensaje(
                "El paquete " + paquete.getId() +
                        " fue " + paquete.getEstado()
        );

        n.setLeido(false);
        System.out.println("NOTIFICACION DISPARADA");
        repo.save(n);
    }
}


