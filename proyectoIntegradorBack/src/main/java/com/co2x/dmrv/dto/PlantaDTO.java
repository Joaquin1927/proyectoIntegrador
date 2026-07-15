package com.co2x.dmrv.dto;

import lombok.Data;
import java.util.List;

@Data
public class PlantaDTO {

    public Integer id;

    public String nombre;

    public String empresa;

    public String direccion;

    public String managerEmail;

    public String metadata;

    public List<PozoDTO> pozos;

    public String pdfTecnico;
}
