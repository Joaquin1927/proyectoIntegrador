package com.co2x.dmrv.dto;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

public class RecordDTO {
    @Data
    public class Record {

        @Id
        @GeneratedValue
        private Long id;

        private String data;

        private String status;

        private String ipfsCid;

    }
}
