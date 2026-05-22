package com.co2x.dmrv.controller;

import com.co2x.dmrv.repository.RecordRepository;
import com.co2x.dmrv.service.RecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/records")
public class RecordController {

    @Autowired
    private RecordRepository repository;

    @Autowired
    private RecordService recordService;

    @PostMapping("/{id}/approve")
    public String approve(@PathVariable Long id) {
        recordService.approveRecord(id);
        return "Record aprobado";
    }

}