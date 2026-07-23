package com.co2x.dmrv.Test;

import com.co2x.dmrv.controller.PaqueteController;
import com.co2x.dmrv.service.PaqueteCO2Service;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PaqueteControllerRouteTest {

    @Test
    void minteadosNoDebeInterpretarseComoId() throws Exception {
        PaqueteCO2Service paqueteService = mock(PaqueteCO2Service.class);
        when(paqueteService.listarMinteados()).thenReturn(List.of());

        PaqueteController controller = new PaqueteController();
        ReflectionTestUtils.setField(controller, "paqueteService", paqueteService);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get("/paquetes/minteados"))
                .andExpect(status().isOk());

        verify(paqueteService).listarMinteados();
    }
}
