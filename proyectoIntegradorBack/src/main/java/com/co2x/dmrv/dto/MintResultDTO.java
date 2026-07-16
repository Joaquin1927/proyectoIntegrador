package com.co2x.dmrv.dto;

public record MintResultDTO(
        Integer paqueteId,
        String estado,
        String ipfsCid,
        String transactionHash,
        boolean transaccionReutilizada
) {
}
