package com.co2x.dmrv.Test;


import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Record;
import com.co2x.dmrv.repository.HistorialPaqueteRepository;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.repository.ReporteRepository;
import com.co2x.dmrv.service.AuditoriaService;
import com.co2x.dmrv.service.HistorialService;
import com.co2x.dmrv.service.RecordService;
import com.co2x.dmrv.service.SecurityService;
import com.co2x.dmrv.service.observer.PaqueteObserver;
import com.co2x.dmrv.utils.Factory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditoriaServiceTest {

    @InjectMocks
    private AuditoriaService auditoriaService;

    @Mock
    private PaqueteCO2Repository paqueteRepo;

    @Mock
    private ReporteRepository reporteRepo;

    @Mock
    private HistorialPaqueteRepository historialRepo;

    @Mock
    private RecordService recordService;

    @Mock
    private Factory factory;

    @Spy
    private List<PaqueteObserver> observers = new ArrayList<>();

    @Mock
    private HistorialService historialService;

    @Mock
    private SecurityService securityService;

    @BeforeEach
    void configurarUsuario() {
        lenient().when(securityService.getCurrentUserEmail()).thenReturn("auditor@test.com");
    }

    private void mockAuditor() {

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim(
                        "preferred_username",
                        "auditor@test.com"
                )
                .claim(
                        "roles",
                        List.of("auditor")
                )
                .build();

        SecurityContextHolder
                .getContext()
                .setAuthentication(
                        new JwtAuthenticationToken(jwt)
                );
    }

    @Test
    void deberiaAprobarPaquete() {

        mockAuditor();

        PaqueteCO2 paquete = new PaqueteCO2();

        paquete.setId(1);
        paquete.setEstado(
                EstadoPaquete.PENDIENTE
        );
        paquete.setCreatedBy(
                "empleado@test.com"
        );

        when(paqueteRepo.findById(1))
                .thenReturn(
                        Optional.of(paquete)
                );

        Record record = mock(Record.class);

        when(record.getIpfsCid())
                .thenReturn("cid-test");

        when(
                recordService.generateFromPaquete(any())
        ).thenReturn(record);

        when(factory.toPaqueteDTO(any()))
                .thenReturn(
                        new PaqueteCO2DTO()
                );

        auditoriaService.aprobar(1);

        assertEquals(
                EstadoPaquete.APROBADO,
                paquete.getEstado()
        );

        verify(reporteRepo)
                .save(any());

        verify(paqueteRepo)
                .save(paquete);
    }

    @Test
    void deberiaRechazarPaquete() {

        mockAuditor();

        PaqueteCO2 paquete =
                new PaqueteCO2();

        paquete.setId(1);

        paquete.setEstado(
                EstadoPaquete.PENDIENTE
        );

        when(paqueteRepo.findById(1))
                .thenReturn(
                        Optional.of(paquete)
                );

        when(factory.toPaqueteDTO(any()))
                .thenReturn(
                        new PaqueteCO2DTO()
                );

        auditoriaService.rechazar(1);

        assertEquals(
                EstadoPaquete.RECHAZADO,
                paquete.getEstado()
        );
    }

    @Test
    void deberiaLanzarExcepcionSiPaqueteNoExiste() {

        mockAuditor();

        when(paqueteRepo.findById(999))
                .thenReturn(
                        Optional.empty()
                );

        assertThrows(
                RuntimeException.class,
                () -> auditoriaService.aprobar(999)
        );
    }
}
