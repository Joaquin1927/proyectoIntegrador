    package com.co2x.dmrv.repository;

    import com.co2x.dmrv.dto.EmpresaDTO;
    import com.co2x.dmrv.entity.Empresa;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.stereotype.Repository;

    import java.util.Optional;

    @Repository
    public interface EmpresaRepository
            extends JpaRepository<Empresa, Integer> {
        Optional<Empresa> findByNombreIgnoreCase(String nombre);
    }