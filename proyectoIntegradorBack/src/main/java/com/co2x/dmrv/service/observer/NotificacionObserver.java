package com.co2x.dmrv.service.observer;

import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.Notificacion;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.repository.NotificacionRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class NotificacionObserver implements PaqueteObserver {

    private final NotificacionRepository repo;

    public NotificacionObserver(
            NotificacionRepository repo
    ) {
        this.repo = repo;
    }

    @Override
    public void update(PaqueteCO2 paquete) {

        String destinatario;

        if (
                paquete.getEstado()
                        == EstadoPaquete.EN_REVISION_CORREGIDO
        ) {

            destinatario = paquete.getAuditor();

        } else {

            destinatario = paquete.getCreatedBy();
        }

        Notificacion n = new Notificacion();

        n.setUsuario(destinatario);

        n.setPaqueteId(paquete.getId());

        n.setMensaje(
                "El paquete "
                        + paquete.getId()
                        + " fue "
                        + paquete.getEstado()
        );

        n.setLeido(false);

        n.setFecha(
                LocalDateTime.now()
        );

        System.out.println(
                "NOTIFICACION DISPARADA PARA: "
                        + destinatario
        );

        repo.save(n);
    }
}