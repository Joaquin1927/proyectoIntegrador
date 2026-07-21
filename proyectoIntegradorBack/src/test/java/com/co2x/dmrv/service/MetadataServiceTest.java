package com.co2x.dmrv.service;

import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Record;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MetadataServiceTest {

    @Test
    void generaElMismoContenidoParaElMismoPaquete() {
        IpfsService ipfsService = mock(IpfsService.class);
        when(ipfsService.uploadJSON(anyString())).thenReturn("QmMismoCid");

        MetadataService service = new MetadataService();
        ReflectionTestUtils.setField(service, "ipfsService", ipfsService);
        ReflectionTestUtils.setField(service, "objectMapper", new ObjectMapper());

        PaqueteCO2 paquete = new PaqueteCO2();
        paquete.setId(226);
        paquete.setCertId("CO2X-226");
        paquete.setCaptureDate(LocalDate.of(2026, 7, 21));
        paquete.setTonCO2eq(120D);
        paquete.setMetadata("{\"captureMethod\":\"direct_air_capture\"}");

        Record primero = record(1L, paquete);
        Record reintentado = record(999L, paquete);

        service.processApprovedRecord(primero);
        service.processApprovedRecord(reintentado);

        ArgumentCaptor<String> json = ArgumentCaptor.forClass(String.class);
        verify(ipfsService, times(2)).uploadJSON(json.capture());
        assertEquals(json.getAllValues().get(0), json.getAllValues().get(1));
    }

    private Record record(Long id, PaqueteCO2 paquete) {
        Record record = new Record();
        record.setId(id);
        record.setStatus("APPROVED");
        record.setCreatedBy("empleado@co2x.com");
        record.setPaquete(paquete);
        return record;
    }
}
