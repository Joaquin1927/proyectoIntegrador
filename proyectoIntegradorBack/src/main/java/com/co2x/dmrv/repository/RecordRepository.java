package com.co2x.dmrv.repository;

import com.co2x.dmrv.entity.Record;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecordRepository extends JpaRepository<Record, Long> {

    Optional<Record> findByPaqueteId(Integer paqueteId);

}