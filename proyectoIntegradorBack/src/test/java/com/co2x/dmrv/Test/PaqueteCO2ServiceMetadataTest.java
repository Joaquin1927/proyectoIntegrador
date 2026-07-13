package com.co2x.dmrv.Test;


import com.co2x.dmrv.service.PaqueteCO2Service;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class PaqueteCO2ServiceMetadataTest {

    private PaqueteCO2Service service;

    @BeforeEach
    void setup() {
        service = new PaqueteCO2Service();
    }
    @Test
    public void deberiaProcesarMetadataValida() {

        Map<String, Object> result =
                service.procesarMetadata("""
            {
                "tonCO2eq": 10,
                "captureMethod": "post_combustion"
            }
            """);

        assertEquals(10.0, result.get("_tonCO2eq"));
        assertEquals(
                "post_combustion",
                result.get("captureMethod")
        );
    }
    @Test
    public void deberiaEliminarCamposProhibidos() {

        Map<String, Object> result =
                service.procesarMetadata("""
            {
                "tonCO2eq": 20,
                "estado": "APROBADO",
                "createdBy": "hacker@test.com",
                "certId": "hack"
            }
            """);

        assertFalse(result.containsKey("estado"));
        assertFalse(result.containsKey("createdBy"));
        assertFalse(result.containsKey("certId"));
    }
    @Test
    void deberiaFallarSiNoExisteTonCO2eq() {

        IllegalArgumentException ex =
                org.junit.jupiter.api.Assertions.assertThrows(
                        IllegalArgumentException.class,
                        () -> service.procesarMetadata("""
                    {
                        "captureMethod": "post_combustion"
                    }
                    """)
                );

        assertEquals(
                "tonCO2eq es obligatorio",
                ex.getMessage()
        );
    }
    @Test
    void deberiaFallarSiTonCO2eqEsNegativo() {

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> service.procesarMetadata("""
            {
                "tonCO2eq": -10
            }
            """)
        );
    }
    @Test
    void deberiaConservarCamposPersonalizados() {

        Map<String, Object> result =
                service.procesarMetadata("""
            {
                "tonCO2eq": 10,
                "randomField": "valor"
            }
            """);

        assertEquals(
                "valor",
                result.get("randomField")
        );
    }
}
