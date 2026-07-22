package com.co2x.dmrv.dto;

import java.time.LocalDate;

public record PaqueteMinteadoDTO(
        Integer paqueteId,
        String certId,
        Double tonCO2eq,
        LocalDate captureDate,
        String planta,
        String auditor,
        String metadata,
        String ipfsCid,
        String blockchainTxHash
) {
}
