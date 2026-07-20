package com.co2x.dmrv.Test;

import com.co2x.dmrv.controller.NotificacionController;
import com.co2x.dmrv.dto.NotificacionDTO;
import com.co2x.dmrv.entity.Notificacion;
import com.co2x.dmrv.repository.NotificacionRepository;
import com.co2x.dmrv.service.SecurityService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
    class NotificacionControllerTest {

        @Mock
        private NotificacionRepository repo;

        @Mock
        private SecurityService securityService;

        @InjectMocks
        private NotificacionController controller;

        @Test
        void debeRetornarNotificacionesNoLeidas() {

            Notificacion n = new Notificacion();
            n.setId(1);
            n.setUsuario("test@co2x.com");
            n.setMensaje("Nueva notificación");
            n.setLeido(false);

            when(repo.findByUsuarioAndLeidoFalse("test@co2x.com"))
                    .thenReturn(List.of(n));

            List<NotificacionDTO> resultado =
                    controller.getNoLeidas("test@co2x.com");

            assertEquals(1, resultado.size());
            assertEquals("Nueva notificación",
                    resultado.get(0).getMensaje());

            verify(securityService)
                    .validarUsuarioSolicitado("test@co2x.com");

            verify(repo)
                    .findByUsuarioAndLeidoFalse("test@co2x.com");
        }
        @Test
        void debeRetornarTodasLasNotificaciones() {

            Notificacion n = new Notificacion();
            n.setUsuario("test@co2x.com");

            when(repo.findByUsuario("test@co2x.com"))
                    .thenReturn(List.of(n));

            var resultado =
                    controller.getTodas("test@co2x.com");

            assertEquals(1, resultado.size());

            verify(securityService)
                    .validarUsuarioSolicitado("test@co2x.com");

            verify(repo)
                    .findByUsuario("test@co2x.com");
        }
        @Test
        void debeMarcarTodasLasNotificacionesComoLeidas() {

            Notificacion n1 = new Notificacion();
            n1.setLeido(false);

            Notificacion n2 = new Notificacion();
            n2.setLeido(false);

            List<Notificacion> lista =
                    List.of(n1, n2);

            when(repo.findByUsuarioAndLeidoFalse("test@co2x.com"))
                    .thenReturn(lista);

            controller.marcarLeidas("test@co2x.com");

            assertTrue(n1.isLeido());
            assertTrue(n2.isLeido());

            verify(securityService)
                    .validarUsuarioSolicitado("test@co2x.com");

            verify(repo)
                    .saveAll(lista);
        }
        @Test
        void debeLanzarExcepcionSiNoPuedeValidarUsuario() {

            doThrow(new AccessDeniedException("Acceso denegado"))
                    .when(securityService)
                    .validarUsuarioSolicitado("otro@co2x.com");

            assertThrows(
                    AccessDeniedException.class,
                    () -> controller.marcarLeidas("otro@co2x.com")
            );

            verify(repo, never())
                    .saveAll(any());
        }
    @Test
    void noDebeGuardarSiNoHayNotificaciones() {

        when(repo.findByUsuarioAndLeidoFalse("test@co2x.com"))
                .thenReturn(List.of());

        controller.marcarLeidas("test@co2x.com");

        verify(repo).saveAll(List.of());
    }
    }

