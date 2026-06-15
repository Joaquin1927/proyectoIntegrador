package com.co2x.dmrv.Test;

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.dto.PlantaDTO;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.service.PaqueteCO2Service;
import com.co2x.dmrv.service.PlantaService;
import com.co2x.dmrv.utils.Factory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Map;

import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


@SpringBootTest
class PaqueteCO2ServiceTest {

    @MockBean
    private PaqueteCO2Repository paqueteRepo;

    @MockBean
    private PlantaService plantaService;

    @MockBean
    private Factory factory;

    @Autowired
    private PaqueteCO2Service service;


    @Test
    void deberiaCrearPaqueteCorrectamente() throws Exception {

        // 🔹 DTO
        PaqueteCO2DTO dto = new PaqueteCO2DTO();

        // ✅ USAR PlantaDTO (no Planta)
        PlantaDTO plantaDTO = new PlantaDTO();
        plantaDTO.setId(1);

        dto.setPlanta(plantaDTO);

        // ✅ metadata válida
        dto.setMetadata("{\"tonCO2eq\": 10}");

        // 🔹 entidad simulada
        PaqueteCO2 entity = new PaqueteCO2();

        Planta planta = new Planta();
        planta.setId(1);

        // 🔹 mocks
        when(plantaService.getEntity(1)).thenReturn(planta);
        when(factory.toPaqueteEntity(any(), eq(planta))).thenReturn(entity);
        when(paqueteRepo.save(any())).thenReturn(entity);
        when(factory.toPaqueteDTO(any())).thenReturn(dto);

        // 🔹 ejecutar
        PaqueteCO2DTO result = service.crear(dto);

        // 🔹 asserts
        assertNotNull(result);
        verify(paqueteRepo).save(any());
    }

}
