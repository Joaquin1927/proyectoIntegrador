package com.co2x.dmrv.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.co2x.dmrv.entity.Planta;

import java.util.List;

public interface PlantaRepository extends JpaRepository<Planta, Integer> {
    List<Planta> findByEmpresa_Id(Integer empresaId);

    @Query("""
            select p.id as id, p.nombre as nombre
            from Planta p
            where p.empresa.id = :empresaId
            order by p.nombre
            """)
    List<PlantaResumen> findResumenByEmpresaId(@Param("empresaId") Integer empresaId);

    interface PlantaResumen {
        Integer getId();
        String getNombre();
    }
}
