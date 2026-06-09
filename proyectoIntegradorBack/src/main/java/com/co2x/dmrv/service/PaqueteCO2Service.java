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

    public List<PaqueteCO2DTO> listar() {
        return paqueteRepo.findAll()
                .stream()
                .map(factory::toPaqueteDTO)
                .toList();
    }
    public List<PaqueteCO2DTO> listarPendientes() {

        return paqueteRepo
                .findByEstado(EstadoPaquete.PENDIENTE)
                .stream()
                .map(factory::toPaqueteDTO)
                .toList();
    }
    public List<PaqueteCO2DTO> listarPorUsuario(String email) {
        return paqueteRepo.findByCreatedBy(email)
                .stream()
                .map(factory::toPaqueteDTO)
                .toList();
    }
    public PaqueteCO2DTO crear(PaqueteCO2DTO dto) {

        System.out.println("CREATED BY DTO = " + dto.createdBy);

        Planta planta = plantaService.getEntity(dto.plantaId);

        PaqueteCO2 entity = factory.toPaqueteEntity(dto, planta);

        System.out.println("CREATED BY ENTITY = " + entity.getCreatedBy());

        entity.setEstado(EstadoPaquete.PENDIENTE);

        PaqueteCO2 guardado = paqueteRepo.save(entity);

        return factory.toPaqueteDTO(guardado);
    }
}