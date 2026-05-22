package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.repository.PlantaRepository;
import com.co2x.dmrv.utils.Factory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaqueteCO2Service {

    @Autowired
    private PaqueteCO2Repository paqueteRepo;

    @Autowired
    private Factory factory;

    @Autowired
    private PlantaService plantaService;


    public PaqueteCO2DTO crear(PaqueteCO2DTO dto) {

        Planta planta = plantaService.getEntity(dto.id);

        // 2. Paso DTO → Entity
        PaqueteCO2 entity = factory.toPaqueteEntity(dto, planta);

        // 3. Guardo en DB
        PaqueteCO2 guardado = paqueteRepo.save(entity);

        // 4. Devuelvo DTO
        return factory.toPaqueteDTO(guardado);
    }
}