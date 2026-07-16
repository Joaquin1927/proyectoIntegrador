package com.co2x.dmrv.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TransferTokenRequestDTO(
        @NotBlank(message = "La wallet de destino es obligatoria") String destinationWallet,
        @NotNull(message = "El monto es obligatorio")
        @DecimalMin(value = "0.000000000000000001", message = "El monto debe ser mayor a cero") BigDecimal amount
) {
}
