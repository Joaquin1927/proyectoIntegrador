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

        Record record = new Record();

        record.setStatus("APPROVED");
        record.setPaquete(paquete);
        record.setCreatedBy(paquete.getCreatedBy());

        // ✅ guardar primero para obtener ID
        Record saved = repository.save(record);

        // ✅ generar metadata + subir a IPFS
        String cid = metadataService.processApprovedRecord(saved);

        saved.setIpfsCid(cid);

        // ✅ guardar CID
        return repository.save(saved);
    }
}