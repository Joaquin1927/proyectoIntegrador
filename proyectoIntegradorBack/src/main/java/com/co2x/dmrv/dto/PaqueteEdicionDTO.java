package com.co2x.dmrv.dto;


import lombok.Data;

import java.util.List;
import java.util.Map;
@Data
public class PaqueteEdicionDTO {

    private Integer id;

    private String estado;
    private String createdBy;
    private Map<String, Object> metadata;

    private List<CampoConErrorDTO> camposConError;

    private String comentarioGeneral;
}
