package com.co2x.dmrv.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class Record {

    @Id
    @GeneratedValue
    private Long id;

    private String status;

    private String ipfsCid;

    /** Hash de la transacción de mint. También actúa como clave de idempotencia. */
    private String blockchainTxHash;

    private String createdBy;

    @ManyToOne
    private PaqueteCO2 paquete;
}
