package com.co2x.dmrv.Test;

import com.co2x.dmrv.service.PaqueteCO2Service;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class PaqueteCO2ServiceTest {

    @Autowired
    private PaqueteCO2Service service;



    @Test
    void deberiaProcesarTonCO2Correctamente() {
        String json = "{\"tonCO2eq\": 5}";

        var result = service.procesarMetadata(json);

        assertEquals(5.0, result.get("_tonCO2eq"));
    }

    @Test
    void deberiaFallarSinTonCO2eq() {
        String json = "{\"otro\": 10}";

        assertThrows(IllegalArgumentException.class, () -> {
            service.procesarMetadata(json);
        });
    }


}
