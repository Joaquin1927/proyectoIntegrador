package com.co2x.dmrv.Test;

import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.HistorialPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.repository.HistorialPaqueteRepository;
import com.co2x.dmrv.service.HistorialService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@SpringBootTest
class HistorialServiceTest {

    @Autowired
    private HistorialService historialService;

    @MockBean
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