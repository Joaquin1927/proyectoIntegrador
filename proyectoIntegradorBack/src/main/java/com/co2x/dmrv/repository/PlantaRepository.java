package com.co2x.dmrv.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.co2x.dmrv.entity.Planta;

import java.util.List;

public interface PlantaRepository extends JpaRepository<Planta, Integer> {
    List<Planta> findByEmpresa_Id(Integer empresaId);
}

