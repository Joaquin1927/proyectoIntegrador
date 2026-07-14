package com.co2x.dmrv.dto;

import lombok.Data;
import java.util.List;

@Data
public class PlantaDTO {

    public Integer id;
    public String nombre;
    public String empresa;
    public String direccion;
    public Double latitud;
    public Double longitud;
    public String managerEmail;

    public String metadata; // JSON string

    public List<PozoDTO> pozos;

    public String pdfTecnico;

}
