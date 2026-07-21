package com.co2x.dmrv.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "record", uniqueConstraints =
        @UniqueConstraint(name = "uk_record_paquete", columnNames = "paquete_id"))
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

    @OneToOne
    @JoinColumn(name = "paquete_id", nullable = false, unique = true)
    private PaqueteCO2 paquete;
}
