package com.co2x.dmrv.service;
import com.co2x.dmrv.model.Record;
import com.co2x.dmrv.repository.RecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MetadataService {

    @Autowired
    private RecordRepository repository;

    public void processApprovedRecord(Record record) {
        try {
            String metadata = buildMetadata(record);

            System.out.println(metadata); // para probar

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 👇 ACA VA TU MÉTODO
    private String buildMetadata(Record record) {
        return "{"
                + "\"id\": \"" + record.getId() + "\","
                + "\"data\": \"" + record.getData() + "\","
                + "\"status\": \"" + record.getStatus() + "\""
                + "}";
    }
}