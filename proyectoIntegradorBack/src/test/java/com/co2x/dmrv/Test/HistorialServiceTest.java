package com.co2x.dmrv.Test;

import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.HistorialPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.repository.HistorialPaqueteRepository;
import com.co2x.dmrv.service.HistorialService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class HistorialServiceTest {

    @InjectMocks
    private HistorialService historialService;

    @Mock
    private HistorialPaqueteRepository historialRepo;

    @Test
    void deberiaGuardarHistorial() {

        PaqueteCO2 paquete = new PaqueteCO2();

        Planta planta = new Planta();
        planta.setNombre("Planta Test");

        paquete.setId(1);
        paquete.setEstado(EstadoPaquete.PENDIENTE);
        paquete.setMetadata("{\"tonCO2eq\":10}");
        paquete.setTonCO2eq(10.0);
        paquete.setPlanta(planta);

        historialService.registrarHistorial(
                paquete,
                "usuario@test.com",
                EstadoPaquete.PENDIENTE,
                List.of(
                        Map.of(
                                "tipo",
                                "CREACION"
                        )
                )
        );

        verify(historialRepo)
                .save(any(HistorialPaquete.class));
    }
}
