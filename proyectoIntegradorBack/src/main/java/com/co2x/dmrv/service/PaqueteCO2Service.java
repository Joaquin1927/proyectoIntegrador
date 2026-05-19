package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.model.PaqueteCO2;
import com.co2x.dmrv.model.Reporte;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.repository.ReporteRepository;
import com.co2x.dmrv.utils.Factory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaqueteCO2Service {

    @Autowired
    private PaqueteCO2Repository paqueteRepo;

    @Autowired
    private ReporteRepository reporteRepo;

    @Autowired
    private Factory factory;

    public PaqueteCO2DTO crear(PaqueteCO2DTO dto) {

        // 1. Busco el reporte
        Reporte reporte = reporteRepo.findById(dto.reporteId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

        // 2. Paso DTO → Entity
        PaqueteCO2 entity = factory.toPaqueteEntity(dto, reporte);

        // 3. Guardo en DB
        PaqueteCO2 guardado = paqueteRepo.save(entity);

        // 4. Devuelvo DTO
        return factory.toPaqueteDTO(guardado);
    }
}