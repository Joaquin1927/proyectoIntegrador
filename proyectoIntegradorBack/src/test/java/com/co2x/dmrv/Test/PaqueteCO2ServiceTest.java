package com.co2x.dmrv.Test;

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.dto.PlantaDTO;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.service.PaqueteCO2Service;
import com.co2x.dmrv.service.HistorialService;
import com.co2x.dmrv.service.PlantaService;
import com.co2x.dmrv.service.SecurityService;
import com.co2x.dmrv.utils.Factory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
class PaqueteCO2ServiceTest {

    @Mock
    private PaqueteCO2Repository paqueteRepo;

    @Mock
    private PlantaService plantaService;

    @Mock
    private Factory factory;

    @Mock
    private SecurityService securityService;

    @Mock
    private HistorialService historialService;

    @InjectMocks
    private PaqueteCO2Service service;


    @Test
    void deberiaCrearPaqueteCorrectamente() throws Exception {

        PaqueteCO2DTO dto = new PaqueteCO2DTO();

        PlantaDTO plantaDTO = new PlantaDTO();
        plantaDTO.setId(1);

        dto.setPlanta(plantaDTO);
        dto.setCaptureDate(LocalDate.of(2026, 7, 1));

        dto.setMetadata("{\"tonCO2eq\": 10}");

        PaqueteCO2 entity = new PaqueteCO2();
        entity.setId(1);

        Planta planta = new Planta();
        planta.setId(1);

        when(plantaService.getEntity(1)).thenReturn(planta);
        when(factory.toPaqueteEntity(any(), eq(planta))).thenReturn(entity);
        when(securityService.getCurrentUserEmail()).thenReturn("empleado@test.com");
        when(paqueteRepo.saveAndFlush(any())).thenReturn(entity);
        when(factory.toPaqueteDTO(any())).thenReturn(dto);

        PaqueteCO2DTO result = service.crear(dto);

        assertNotNull(result);
        verify(paqueteRepo).saveAndFlush(any());
    }

    @Test
    void deberiaFallarSiNoExisteTonCO2eq() {

        IllegalArgumentException ex =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> service.procesarMetadata("""
                    {
                        "captureMethod":"post_combustion"
                    }
                    """)
                );

        assertEquals(
                "tonCO2eq es obligatorio",
                ex.getMessage()
        );
    }

    @Test
    void deberiaFallarSiNoHayPlanta() {

        PaqueteCO2DTO dto = new PaqueteCO2DTO();

        RuntimeException ex =
                assertThrows(
                        RuntimeException.class,
                        () -> service.crear(dto)
                );

        assertEquals(
                "Planta es obligatoria",
                ex.getMessage()
        );
    }
    @Test
    void deberiaFallarConJsonInvalido() {

        assertThrows(
                RuntimeException.class,
                () -> service.procesarMetadata("{")
        );
    }
    @Test
    void deberiaEliminarCamposProhibidos() {

        Map<String,Object> result =
                service.procesarMetadata("""
            {
                "createdBy":"hack",
                "estado":"APROBADO",
                "tonCO2eq":10
            }
            """);

        assertEquals(
                false,
                result.containsKey("createdBy")
        );

        assertEquals(
                false,
                result.containsKey("estado")
        );
    }
}
