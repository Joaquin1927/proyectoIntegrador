package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.PaqueteCO2DTO;
import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.repository.PlantaRepository;
import com.co2x.dmrv.utils.Factory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import static java.util.Arrays.stream;

@Service
public class PaqueteCO2Service {

    @Autowired
    private PaqueteCO2Repository paqueteRepo;

    @Autowired
    private Factory factory;

    @Autowired
    private PlantaService plantaService;

    public List<PaqueteCO2DTO> listarPendientes() {

        return paqueteRepo
                .findByEstado(EstadoPaquete.PENDIENTE)
                .stream()
                .map(factory::toPaqueteDTO)
                .toList();
    }
    public PaqueteCO2DTO crear(PaqueteCO2DTO dto) {

        System.out.println("DTO ID = " + dto.id);
        System.out.println("PLANTA DTO = " + dto.planta);
        System.out.println("PLANTA ID = " + dto.planta.getId());

        Planta planta = plantaService.getEntity(dto.planta.getId());

        PaqueteCO2 entity = factory.toPaqueteEntity(dto, planta);

        entity.setEstado(EstadoPaquete.PENDIENTE);

        PaqueteCO2 guardado = paqueteRepo.save(entity);

        return factory.toPaqueteDTO(guardado);
    }
}