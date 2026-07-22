package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.PlantaDTO;
import com.co2x.dmrv.entity.Empresa;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.repository.EmpresaRepository;
import com.co2x.dmrv.repository.PlantaRepository;
import com.co2x.dmrv.utils.Factory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlantaService {

    private final PlantaRepository plantaRepo;

    private final Factory factory;

    private final EmpresaRepository empresaRepo;

    private final SecurityService securityService;

    public PlantaService(
            PlantaRepository plantaRepo,
            Factory factory,
            EmpresaRepository empresaRepo,
            SecurityService securityService) {
        this.plantaRepo = plantaRepo;
        this.factory = factory;
        this.empresaRepo = empresaRepo;
        this.securityService = securityService;
    }

    public PlantaDTO crear(PlantaDTO dto) {
        System.out.println("=== ENTRE A PLANTA SERVICE ===");
        System.out.println(dto);
        securityService.validarAdmin();
        if (dto.getNombre() == null || dto.getNombre().isBlank()) {
            throw new RuntimeException("Nombre obligatorio");
        }
        if (dto.getEmpresa() == null) {
            throw new RuntimeException("Empresa obligatoria");
        }
        if (dto.getDireccion() == null || dto.getDireccion().isBlank()) {
            throw new RuntimeException("Dirección obligatoria");
        }
        if (dto.getManagerEmail() == null || dto.getManagerEmail().isBlank()) {
            throw new RuntimeException("ManagerEmail obligatorio");
        }
        if (dto.getMetadata() == null) {
            dto.setMetadata("{}");
        }
        Empresa empresa;
        if (dto.getEmpresa().getId() != null) {
            empresa = empresaRepo
                    .findById(dto.getEmpresa().getId())
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Empresa no encontrada"
                            )
                    );
        } else if (
                dto.getEmpresa().getNombre() != null
                        && !dto.getEmpresa().getNombre().isBlank()
        ) {
            empresa = empresaRepo
                    .findByNombreIgnoreCase(
                            dto.getEmpresa().getNombre()
                    )
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Empresa no encontrada"
                            )
                    );
        } else {
            throw new RuntimeException(
                    "Empresa obligatoria"
            );
        }
        Planta entity =
                factory.toPlantaEntity(dto);
        entity.setEmpresa(empresa);
        Planta guardada =
                plantaRepo.save(entity);
        return factory.toPlantaDTO(
                guardada
        );
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
                .orElseThrow(
                        () -> new RuntimeException(
                                "Planta no encontrada"
                        )
                );
    }

    public List<PlantaDTO> listarPorEmpresa(Integer empresaId) {
        return plantaRepo.findResumenByEmpresaId(empresaId)
                .stream()
                .map(planta -> {
                    PlantaDTO dto = new PlantaDTO();
                    dto.setId(planta.getId());
                    dto.setNombre(planta.getNombre());
                    return dto;
                })
                .toList();
    }


}
