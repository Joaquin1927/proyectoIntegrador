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


    private String generarMensaje(
            PaqueteCO2 paquete
    ) {

        return switch (paquete.getEstado()) {

            case APROBADO ->
                    "El paquete "
                            + paquete.getId()
                            + " ha sido aprobado";

            case RECHAZADO ->
                    "El paquete "
                            + paquete.getId()
                            + " ha sido rechazado";

            case EN_REVISION ->
                    "El paquete "
                            + paquete.getId()
                            + " requiere correcciones";

            case EN_REVISION_CORREGIDO ->
                    "El paquete "
                            + paquete.getId()
                            + " ha sido corregido y está listo para revisión";

            default ->
                    "El paquete "
                            + paquete.getId()
                            + " ha sido actualizado";
        };
    }


    @Override
    public void update(PaqueteCO2 paquete) {

        System.out.println("ESTADO: " + paquete.getEstado());
        System.out.println("CREATED BY: " + paquete.getCreatedBy());
        System.out.println("AUDITOR: " + paquete.getAuditor());

        String destinatario;

        if (
                paquete.getEstado()
                        == EstadoPaquete.EN_REVISION_CORREGIDO
        ) {

            destinatario = paquete.getAuditor();

        } else {

            destinatario = paquete.getCreatedBy();
        }
        System.out.println("DESTINATARIO FINAL: " + destinatario);

        Notificacion n = new Notificacion();

        n.setUsuario(destinatario);

        n.setPaqueteId(paquete.getId());

        n.setMensaje(
                generarMensaje(paquete)
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