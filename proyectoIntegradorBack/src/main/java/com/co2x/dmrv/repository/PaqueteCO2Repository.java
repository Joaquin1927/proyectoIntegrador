package com.co2x.dmrv.repository;

import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Planta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PaqueteCO2Repository
        extends JpaRepository<PaqueteCO2, Integer>, JpaSpecificationExecutor<PaqueteCO2> {

    List<PaqueteCO2> findByEstado(EstadoPaquete estado);

    List<PaqueteCO2> findByEstadoIn(List<EstadoPaquete> estados);
    List<PaqueteCO2> findByCreatedBy(String createdBy);
    List<PaqueteCO2> findTop5ByCreatedByOrderByIdDesc(
            String createdBy
    );
    boolean existsByDataFingerprint(String dataFingerprint);

    @Query("SELECT COUNT(p) FROM PaqueteCO2 p WHERE p.planta = :planta")
    Long countByPlanta(@Param("planta") Planta planta);

}
