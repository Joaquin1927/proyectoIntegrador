package com.co2x.dmrv.service;

import com.co2x.dmrv.repository.RecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.co2x.dmrv.model.Record;

@Service
public class RecordService {

    @Autowired
    private RecordRepository repository;

    @Autowired
    private MetadataService metadataService;

    public void approveRecord(Long id) {

        Record record = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record no encontrado: " + id));

        // 1. cambiar estado
        record.setStatus("APPROVED");

        // 2. generar metadata
        String cid = metadataService.processApprovedRecord(record);

        // 3. guardar CID en entidad
        record.setIpfsCid(cid);

        // 4. persistir en DB
        repository.save(record);
    }
}