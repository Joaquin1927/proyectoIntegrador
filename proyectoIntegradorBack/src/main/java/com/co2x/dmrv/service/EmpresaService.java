package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.EmpresaDTO;
import com.co2x.dmrv.entity.Empresa;
import com.co2x.dmrv.repository.EmpresaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepo;
    private final SecurityService securityService;

    public EmpresaService(EmpresaRepository empresaRepo,
                          SecurityService securityService) {
        this.empresaRepo = empresaRepo;
        this.securityService = securityService;
    }

    public List<EmpresaDTO> listar() {

        // 🔐 Solo ADMIN puede listar empresas
        securityService.validarAdmin();

        return empresaRepo.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public EmpresaDTO crear(EmpresaDTO dto) {

        // 🔐 Solo ADMIN puede crear empresas
        securityService.validarAdmin();

        empresaRepo.findByNombreIgnoreCase(dto.getNombre())
                .ifPresent(e -> {
                    throw new RuntimeException("Ya existe una empresa con ese nombre");
                });

        Empresa empresa = new Empresa();
        empresa.setNombre(dto.getNombre());

        Empresa guardada = empresaRepo.save(empresa);

        return toDTO(guardada);
    }

    private EmpresaDTO toDTO(Empresa empresa) {
        EmpresaDTO dto = new EmpresaDTO();
        dto.setId(empresa.getId());
        dto.setNombre(empresa.getNombre());
        return dto;
    }
}
