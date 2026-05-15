package com.co2x.dmrv.service;
import com.co2x.dmrv.model.Record;
import com.co2x.dmrv.repository.RecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MetadataService {

    @Autowired
    private RecordRepository repository;

    public String processApprovedRecord(Record record) {

            // 1. generar JSON metadata
            String metadataJson = generarMetadata(record);

            // 2. subir a IPFS
            String cid = uploadToIPFS(metadataJson);

            return cid;
    }

    private String uploadToIPFS(String json) {
            // llamada real a IPFS (Pinata, Infura, etc)
            return "Qm123abc..."; // ejemplo
    }

    private String generarMetadata(Record record) {
        return "{"
                + "\"id\": \"" + record.getId() + "\","
                + "\"data\": \"" + record.getData() + "\","
                + "\"status\": \"" + record.getStatus() + "\""
                + "}";
    }

}