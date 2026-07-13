package com.co2x.dmrv.Test;

import com.co2x.dmrv.dto.MintResultDTO;
import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Record;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.repository.RecordRepository;
import com.co2x.dmrv.service.BlockchainService;
import com.co2x.dmrv.service.MintingService;
import com.co2x.dmrv.service.RecordService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;

@ExtendWith(MockitoExtension.class)
class MintingServiceTest {

    @InjectMocks
    private MintingService mintingService;

    @Mock
    private PaqueteCO2Repository paqueteRepo;

    @Mock
    private RecordRepository recordRepo;

    @Mock
    private RecordService recordService;

    @Mock
    private BlockchainService blockchainService;

    @BeforeEach
    void configurarAdmin() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("roles", List.of("ADMIN"))
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt));
        ReflectionTestUtils.setField(mintingService, "destinationWallet", "0xwallet");
    }

    @AfterEach
    void limpiarContexto() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void noDebeMintearDosVecesSiElRecordYaTieneTransaccion() {
        PaqueteCO2 paquete = new PaqueteCO2();
        paquete.setId(61);
        paquete.setEstado(EstadoPaquete.APROBADO);
        paquete.setTonCO2eq(120.0);

        Record record = new Record();
        record.setIpfsCid("QmCid");
        record.setBlockchainTxHash("0xhash");

        when(paqueteRepo.findById(61)).thenReturn(Optional.of(paquete));
        when(recordRepo.findByPaqueteId(61)).thenReturn(Optional.of(record));
        when(recordService.ensureIpfsCid(record)).thenReturn(record);

        MintResultDTO resultado = mintingService.mintearPaquete(61);

        assertEquals(EstadoPaquete.MINTEADO, paquete.getEstado());
        assertEquals("0xhash", resultado.transactionHash());
        assertTrue(resultado.transaccionReutilizada());
        verify(blockchainService, never()).mintToken(anyString(), anyDouble(), anyString());
        verify(paqueteRepo).save(paquete);
    }
}
