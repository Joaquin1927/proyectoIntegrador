package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.EmpresaDTO;
import com.co2x.dmrv.entity.Empresa;
import com.co2x.dmrv.repository.EmpresaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaService {
    private final EmpresaRepository empresaRepo;

    public EmpresaService(EmpresaRepository empresaRepo) {
        this.empresaRepo = empresaRepo;
    }
    public List<EmpresaDTO> listar() {
        return empresaRepo.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }
    private EmpresaDTO toDTO(Empresa empresa) {
        EmpresaDTO dto = new EmpresaDTO();
        dto.setId(empresa.getId());
        dto.setNombre(empresa.getNombre());
        return dto;
    }
}
