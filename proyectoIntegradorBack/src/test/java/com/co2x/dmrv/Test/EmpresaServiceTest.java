package com.co2x.dmrv.Test;

import com.co2x.dmrv.dto.EmpresaDTO;
import com.co2x.dmrv.entity.Empresa;
import com.co2x.dmrv.repository.EmpresaRepository;
import com.co2x.dmrv.service.EmpresaService;
import com.co2x.dmrv.service.SecurityService;
import com.co2x.dmrv.utils.Factory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
 class EmpresaServiceTest {
    @Mock
    private EmpresaRepository empresaRepo;

    @Mock
    private SecurityService securityService;

    @Mock
    private Factory factory;

    @InjectMocks
    private EmpresaService empresaService;

    @Test
    void debeListarEmpresas() {

        Empresa empresa = new Empresa();
        empresa.setNombre("Acme");

        EmpresaDTO dto = new EmpresaDTO();
        dto.setNombre("Acme");

        when(empresaRepo.findAll())
                .thenReturn(List.of(empresa));

        when(factory.toEmpresaDTO(empresa))
                .thenReturn(dto);

        List<EmpresaDTO> resultado =
                empresaService.listar();

        assertEquals(1, resultado.size());
        assertEquals("Acme",
                resultado.get(0).getNombre());

        verify(securityService)
                .validarAdmin();

        verify(empresaRepo)
                .findAll();
    }
    @Test
    void debeCrearEmpresa() {

        EmpresaDTO dto = new EmpresaDTO();
        dto.setNombre("Acme");

        Empresa empresa = new Empresa();
        empresa.setNombre("Acme");

        when(empresaRepo.findByNombreIgnoreCase("Acme"))
                .thenReturn(Optional.empty());

        when(factory.toEmpresaEntity(dto))
                .thenReturn(empresa);

        when(empresaRepo.save(empresa))
                .thenReturn(empresa);

        when(factory.toEmpresaDTO(empresa))
                .thenReturn(dto);

        EmpresaDTO resultado =
                empresaService.crear(dto);

        assertEquals("Acme",
                resultado.getNombre());

        verify(securityService)
                .validarAdmin();

        verify(empresaRepo)
                .save(empresa);
    }
    @Test
    void noDebePermitirEmpresasDuplicadas() {

        EmpresaDTO dto = new EmpresaDTO();
        dto.setNombre("Acme");

        Empresa existente = new Empresa();
        existente.setNombre("Acme");

        when(empresaRepo.findByNombreIgnoreCase("Acme"))
                .thenReturn(Optional.of(existente));

        RuntimeException ex =
                assertThrows(
                        RuntimeException.class,
                        () -> empresaService.crear(dto)
                );

        assertEquals(
                "Ya existe una empresa con ese nombre",
                ex.getMessage()
        );

        verify(empresaRepo, never())
                .save(any());
    }

    @Test
    void listarDebeFallarSiNoEsAdmin() {

        doThrow(new RuntimeException("No autorizado"))
                .when(securityService).validarAdmin();

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> empresaService.listar()
        );

        assertEquals("No autorizado", ex.getMessage());
    }

    @Test
    void crearDebeFallarSiFactoryDevuelveNull() {

        EmpresaDTO dto = new EmpresaDTO();
        dto.setNombre("Acme");

        when(empresaRepo.findByNombreIgnoreCase("Acme"))
                .thenReturn(Optional.empty());

        when(factory.toEmpresaEntity(dto))
                .thenReturn(null);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> empresaService.crear(dto)
        );

        assertEquals("Error al convertir EmpresaDTO a entidad", ex.getMessage());
    }

    @Test
    void listarDebeDevolverListaVacia() {

        when(empresaRepo.findAll())
                .thenReturn(List.of());

        List<EmpresaDTO> resultado = empresaService.listar();

        assertEquals(0, resultado.size());
    }




}
