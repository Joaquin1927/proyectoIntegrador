package com.co2x.dmrv.controller;

import com.co2x.dmrv.repository.RecordRepository;
import com.co2x.dmrv.service.MetadataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.co2x.dmrv.model.Record;

@RestController
@RequestMapping("/records")
public class RecordController {

    @Autowired
    private RecordRepository repository;

    @Autowired
    private MetadataService metadataService;

    @PostMapping("/{id}/approve")
    public String approve(@PathVariable Long id) {

        Record record = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record no encontrado: " + id));

        record.setStatus("APPROVED");
        repository.save(record);

        metadataService.processApprovedRecord(record);

        return "Record aprobado";
    }
}