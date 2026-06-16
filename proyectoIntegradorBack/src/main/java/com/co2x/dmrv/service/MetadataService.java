package com.co2x.dmrv.service;
import com.co2x.dmrv.entity.Record;
import com.co2x.dmrv.repository.RecordRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MetadataService {

    @Autowired
    private IpfsService ipfsService;

    @Autowired
    private ObjectMapper objectMapper;

    public String processApprovedRecord(Record record) {

        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("recordId", record.getId());
            metadata.put("status", "APPROVED");
            metadata.put("timestamp", System.currentTimeMillis());
            metadata.put("data", record.getData());

            String json = objectMapper.writeValueAsString(metadata);

            return ipfsService.uploadJSON(json);

        } catch (Exception e) {
            throw new RuntimeException("Error generando metadata para IPFS", e);
        }
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