package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.EmpresaDTO;
import com.co2x.dmrv.entity.Empresa;
import com.co2x.dmrv.repository.EmpresaRepository;
import com.co2x.dmrv.utils.Factory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepo;
    private final SecurityService securityService;
    private final Factory factory;

    public EmpresaService(
            EmpresaRepository empresaRepo,
            SecurityService securityService,
            Factory factory) {

        this.empresaRepo = empresaRepo;
        this.securityService = securityService;
        this.factory = factory;
    }

    public List<EmpresaDTO> listar() {
        securityService.validarAdmin();

        return empresaRepo.findAll()
                .stream()
                .map(factory::toEmpresaDTO)
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
        Empresa empresa =
                factory.toEmpresaEntity(dto);
        Empresa guardada =
                empresaRepo.save(empresa);
        return factory.toEmpresaDTO(guardada);
    }


}
