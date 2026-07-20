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
        securityService.validarAdmin();

        return empresaRepo.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public EmpresaDTO crear(EmpresaDTO dto) {
        System.out.println("ENTRO A CREAR EMPRESA");
        System.out.println("DTO: " + dto.getNombre());
        securityService.validarAdmin();
        System.out.println("VALIDACION ADMIN OK");
        empresaRepo.findByNombreIgnoreCase(dto.getNombre())
                .ifPresent(e -> {
                    throw new RuntimeException("Ya existe una empresa con ese nombre");
                });
        System.out.println("NO EXISTE EMPRESA");
        Empresa empresa = new Empresa();
        empresa.setNombre(dto.getNombre());
        Empresa guardada = empresaRepo.save(empresa);
        System.out.println("EMPRESA GUARDADA");
        return toDTO(guardada);
    }

    private EmpresaDTO toDTO(Empresa empresa) {
        EmpresaDTO dto = new EmpresaDTO();
        //dto.setId(empresa.getId());
        dto.setNombre(empresa.getNombre());
        dto.setNumeroCorporacion(empresa.getNumeroCorporacion());
        dto.setNumeroEmpresa(empresa.getNumeroEmpresa());
        dto.setDireccion(empresa.getDireccion());
        dto.setDirectores(empresa.getDirectores());
        dto.setContacto(empresa.getContacto());
        return dto;
    }
}
