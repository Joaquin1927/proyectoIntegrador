package com.co2x.dmrv.service;

import com.co2x.dmrv.entity.Record;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.repository.RecordRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RecordService {

    @Autowired
    private RecordRepository repository;

    @Autowired
    private MetadataService metadataService;

    public Record generateFromPaquete(PaqueteCO2 paquete) {

        return repository.findByPaqueteId(paquete.getId())
                .map(this::ensureIpfsCid)
                .orElseGet(() -> createFromPaquete(paquete));
    }

    /**
     * Completa el CID de records creados antes de que la carga a IPFS formara
     * parte del flujo de aprobación.
     */
    public Record ensureIpfsCid(Record record) {

        if (record.getIpfsCid() != null && !record.getIpfsCid().isBlank()) {
            System.out.println("CID existente reutilizado: " + record.getIpfsCid());
            return record;
        }

        String cid = metadataService.processApprovedRecord(record);

        if (cid == null || cid.isBlank()) {
            throw new RuntimeException("IPFS no devolvió un CID válido");
        }

        record.setIpfsCid(cid);
        return repository.save(record);
    }

    private Record createFromPaquete(PaqueteCO2 paquete) {

        Record record = new Record();

        record.setStatus("APPROVED");
        record.setPaquete(paquete);
        record.setCreatedBy(paquete.getCreatedBy());

        // ✅ guardar primero para obtener ID
        Record saved = repository.save(record);

        // ✅ generar metadata, subir a IPFS y guardar el CID
        return ensureIpfsCid(saved);
    }
}
