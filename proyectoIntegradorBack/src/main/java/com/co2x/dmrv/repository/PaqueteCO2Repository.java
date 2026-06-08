package com.co2x.dmrv.repository;

import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface PaqueteCO2Repository
        extends JpaRepository<PaqueteCO2, Integer> {

    List<PaqueteCO2> findByEstado(EstadoPaquete estado);

    List<PaqueteCO2> findByEstadoIn(List<EstadoPaquete> estados);
    List<PaqueteCO2> findByCreatedBy(String createdBy);
}