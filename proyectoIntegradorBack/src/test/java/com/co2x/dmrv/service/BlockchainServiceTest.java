package com.co2x.dmrv.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.BigInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class BlockchainServiceTest {

    @Test
    void convierteMontosMayoresAlLimiteDeLongSinPerderPrecision() {
        assertEquals(
                new BigInteger("120000000000000000000"),
                BlockchainService.toTokenUnits(new BigDecimal("120"))
        );
    }

    @Test
    void conservaLosDieciochoDecimalesDelToken() {
        assertEquals(
                new BigInteger("1250000000000000000"),
                BlockchainService.toTokenUnits(new BigDecimal("1.25"))
        );
    }

    @Test
    void rechazaMasDeDieciochoDecimales() {
        assertThrows(ArithmeticException.class, () ->
                BlockchainService.toTokenUnits(new BigDecimal("0.0000000000000000001"))
        );
    }
}
