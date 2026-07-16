package com.co2x.dmrv.dto;

import java.math.BigDecimal;

public record TransferTokenResultDTO(
        String sourceWallet,
        String destinationWallet,
        BigDecimal amount,
        String transactionHash
) {
}
