package com.co2x.dmrv.service;

import com.co2x.dmrv.entity.Record;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class MetadataService {

    @Autowired
    private IpfsService ipfsService;

    @Autowired
    private ObjectMapper objectMapper;

    public String processApprovedRecord(Record record) {

        try {

            Map<String, Object> metadata = new LinkedHashMap<>();

            // =========================
            // CORE (SIEMPRE)
            // =========================
            // Un paquete tiene un único record lógico. Usar el id del paquete y
            // su fecha de captura mantiene el JSON estable incluso si una
            // transacción de base de datos se revierte después de subir a IPFS.
            metadata.put("recordId", record.getPaquete() != null
                    ? record.getPaquete().getId()
                    : record.getId());
            metadata.put("status", record.getStatus());
            metadata.put("timestamp", record.getPaquete() != null
                    && record.getPaquete().getCaptureDate() != null
                    ? record.getPaquete().getCaptureDate()
                            .atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()
                    : 0L);
            metadata.put("auditor", record.getCreatedBy());

            // =========================
            // DATOS DEL PAQUETE (DINÁMICO)
            // =========================
            if (record.getPaquete() != null) {

                metadata.put("paqueteId", record.getPaquete().getId());
                metadata.put("certId", record.getPaquete().getCertId());
                metadata.put("tonCO2eq", record.getPaquete().getTonCO2eq());

                // metadata original (dinámica)
                Map<String, Object> dataMap = objectMapper.readValue(
                        record.getPaquete().getMetadata(),
                        Map.class
                );

                metadata.put("data", dataMap);

            }

            // =========================
            //  TOKENIZATION
            // =========================
            Map<String, Object> tokenization = new LinkedHashMap<>();

            tokenization.put("receipt_id", null);
            tokenization.put("token_id", null);
            tokenization.put("mint_timestamp", null);
            tokenization.put("minted_supply", null);
            tokenization.put("buffer_allocation", null);
            tokenization.put("reserve_allocation", null);
            tokenization.put("retirement_amount", 0);
            tokenization.put("reversal_amount", 0);
            tokenization.put("freeze_status", false);
            tokenization.put("burn_status", false);
            tokenization.put("clawback_reference", null);
            tokenization.put("liquidity_pool_reference", null);
            tokenization.put("pricing_index", null);
            tokenization.put("market_classification", null);
            tokenization.put("durability_class", null);
            tokenization.put("vintage", null);
            tokenization.put("issuance_class", null);
            tokenization.put("custody_chain", null);

            metadata.put("tokenization", tokenization);

            // =========================
            // ✅ CONVERTIR A JSON
            // =========================
            String json = objectMapper.writeValueAsString(metadata);

            System.out.println("📦 Metadata generada: " + json);

            // =========================
            // SUBIR A IPFS
            // =========================
            return ipfsService.uploadJSON(json);

        } catch (Exception e) {
            throw new RuntimeException("Error generando metadata para IPFS", e);
        }
    }
}
