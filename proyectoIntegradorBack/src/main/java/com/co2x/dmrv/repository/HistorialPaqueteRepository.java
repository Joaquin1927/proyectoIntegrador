package com.co2x.dmrv.repository;

import com.co2x.dmrv.entity.HistorialPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialPaqueteRepository extends JpaRepository<HistorialPaquete, Integer> {

    List<HistorialPaquete> findByPaqueteOrderByFechaDesc(PaqueteCO2 paquete);

    List<HistorialPaquete> findByPaqueteIdOrderByFechaDesc(Integer paqueteId);
}
