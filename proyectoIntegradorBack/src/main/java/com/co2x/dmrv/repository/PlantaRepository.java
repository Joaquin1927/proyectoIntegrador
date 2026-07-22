package com.co2x.dmrv.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.co2x.dmrv.entity.Planta;

import java.util.List;

public interface PlantaRepository extends JpaRepository<Planta, Integer> {
    List<Planta> findByEmpresa_Id(Integer empresaId);

    @Query(
            value = """
                    SELECT id, nombre
                    FROM planta
                    WHERE empresa_id = :empresaId
                    ORDER BY nombre
                    """,
            nativeQuery = true
    )
    List<PlantaResumen> findResumenByEmpresaId(@Param("empresaId") Integer empresaId);

    interface PlantaResumen {
        Integer getId();
        String getNombre();
    }
}
