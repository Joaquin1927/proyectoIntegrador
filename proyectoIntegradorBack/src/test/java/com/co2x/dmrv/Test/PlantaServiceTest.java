package com.co2x.dmrv.Test;

import com.co2x.dmrv.dto.EmpresaDTO;
import com.co2x.dmrv.dto.PlantaDTO;
import com.co2x.dmrv.entity.Empresa;
import com.co2x.dmrv.entity.Planta;
import com.co2x.dmrv.repository.EmpresaRepository;
import com.co2x.dmrv.repository.PlantaRepository;
import com.co2x.dmrv.service.PlantaService;
import com.co2x.dmrv.service.SecurityService;
import com.co2x.dmrv.utils.Factory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlantaServiceTest {

    @Mock
    private PlantaRepository plantaRepo;

    @Mock
    private EmpresaRepository empresaRepo;

    @Mock
    private Factory factory;

    @Mock
    private SecurityService securityService;

    @InjectMocks
    private PlantaService plantaService;

    @Test
    void deberiaCrearPlantaCorrectamente() {

        EmpresaDTO empresaDTO = new EmpresaDTO();
        empresaDTO.setId(1);

        PlantaDTO dto = new PlantaDTO();
        dto.setNombre("Planta Norte");
        dto.setEmpresa(empresaDTO);
        dto.setDireccion("Ruta 101");
        dto.setManagerEmail("manager@test.com");

        Empresa empresa = new Empresa();
        empresa.setId(1);
        empresa.setNombre("EcoTech");

        Planta planta = new Planta();
        Planta guardada = new Planta();

        PlantaDTO esperado = new PlantaDTO();
        esperado.setNombre("Planta Norte");

        when(empresaRepo.findById(1))
                .thenReturn(Optional.of(empresa));

        when(factory.toPlantaEntity(dto))
                .thenReturn(planta);

        when(plantaRepo.save(planta))
                .thenReturn(guardada);

        when(factory.toPlantaDTO(guardada))
                .thenReturn(esperado);

        PlantaDTO resultado =
                plantaService.crear(dto);

        assertNotNull(resultado);

        verify(securityService).validarAdmin();
        verify(plantaRepo).save(planta);
    }

    @Test
    void deberiaFallarSiNombreEsVacio() {

        PlantaDTO dto = new PlantaDTO();
        dto.setNombre("");

        RuntimeException ex =
                assertThrows(
                        RuntimeException.class,
                        () -> plantaService.crear(dto)
                );

        assertEquals(
                "Nombre obligatorio",
                ex.getMessage()
        );
    }

    @Test
    void deberiaFallarSiEmpresaEsNula() {

        PlantaDTO dto = new PlantaDTO();
        dto.setNombre("Planta Norte");
        dto.setEmpresa(null);

        RuntimeException ex =
                assertThrows(
                        RuntimeException.class,
                        () -> plantaService.crear(dto)
                );

        assertEquals(
                "Empresa obligatoria",
                ex.getMessage()
        );
    }

    @Test
    void deberiaFallarSiDireccionEsVacia() {

        EmpresaDTO empresaDTO = new EmpresaDTO();
        empresaDTO.setId(1);

        PlantaDTO dto = new PlantaDTO();
        dto.setNombre("Planta");
        dto.setEmpresa(empresaDTO);
        dto.setDireccion("");
        dto.setManagerEmail("manager@test.com");

        RuntimeException ex =
                assertThrows(
                        RuntimeException.class,
                        () -> plantaService.crear(dto)
                );

        assertEquals(
                "Dirección obligatoria",
                ex.getMessage()
        );
    }

    @Test
    void deberiaFallarSiManagerEmailEsVacio() {

        EmpresaDTO empresaDTO = new EmpresaDTO();
        empresaDTO.setId(1);

        PlantaDTO dto = new PlantaDTO();
        dto.setNombre("Planta");
        dto.setEmpresa(empresaDTO);
        dto.setDireccion("Ruta");
        dto.setManagerEmail("");

        RuntimeException ex =
                assertThrows(
                        RuntimeException.class,
                        () -> plantaService.crear(dto)
                );

        assertEquals(
                "ManagerEmail obligatorio",
                ex.getMessage()
        );
    }

    @Test
    void deberiaFallarSiEmpresaNoExistePorId() {

        EmpresaDTO empresaDTO = new EmpresaDTO();
        empresaDTO.setId(999);

        PlantaDTO dto = new PlantaDTO();
        dto.setNombre("Planta");
        dto.setEmpresa(empresaDTO);
        dto.setDireccion("Ruta");
        dto.setManagerEmail("manager@test.com");

        when(empresaRepo.findById(999))
                .thenReturn(Optional.empty());

        RuntimeException ex =
                assertThrows(
                        RuntimeException.class,
                        () -> plantaService.crear(dto)
                );

        assertEquals(
                "Empresa no encontrada",
                ex.getMessage()
        );
    }

    @Test
    void deberiaListarPlantas() {

        Planta planta = new Planta();
        PlantaDTO dto = new PlantaDTO();

        when(plantaRepo.findAll())
                .thenReturn(List.of(planta));

        when(factory.toPlantaDTO(planta))
                .thenReturn(dto);

        List<PlantaDTO> resultado =
                plantaService.listar();

        assertEquals(1, resultado.size());

        verify(plantaRepo).findAll();
    }

    @Test
    void deberiaObtenerPlantaPorId() {

        Planta planta = new Planta();
        planta.setId(1);

        when(plantaRepo.findById(1))
                .thenReturn(Optional.of(planta));

        Planta resultado =
                plantaService.getEntity(1);

        assertEquals(1, resultado.getId());
    }

    @Test
    void deberiaFallarSiPlantaNoExiste() {

        when(plantaRepo.findById(999))
                .thenReturn(Optional.empty());

        RuntimeException ex =
                assertThrows(
                        RuntimeException.class,
                        () -> plantaService.getEntity(999)
                );

        assertEquals(
                "Planta no encontrada",
                ex.getMessage()
        );
    }
}