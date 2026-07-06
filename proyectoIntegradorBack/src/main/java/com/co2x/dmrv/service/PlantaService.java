package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.PlantaDTO;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.repository.PlantaRepository;
import com.co2x.dmrv.utils.Factory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlantaService {

    @Autowired
    private PlantaRepository plantaRepo;

    @Autowired
    private Factory factory;

    public PlantaDTO crear(PlantaDTO dto) {

        Planta entity = factory.toPlantaEntity(dto);
        Planta guardada = plantaRepo.save(entity);

        return factory.toPlantaDTO(guardada);
    }

    public List<PlantaDTO> listar() {
        return plantaRepo.findAll()
                .stream()
                .map(factory::toPlantaDTO)
                .toList();
    }

    public Planta getEntity(Integer id) {
        System.out.println("BUSCANDO PLANTA: " + id);
        return plantaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Planta no encontrada"));
    }
}