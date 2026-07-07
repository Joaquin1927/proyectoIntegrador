package com.co2x.dmrv.service;

import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.entity.Record;
import com.co2x.dmrv.repository.PaqueteCO2Repository;
import com.co2x.dmrv.repository.RecordRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MintingService {

    @Autowired
    private PaqueteCO2Repository paqueteRepo;

    @Autowired
    private RecordRepository recordRepo;

    @Autowired
    private BlockchainService blockchainService;

    @Value("${blockchain.destination.wallet}")
    private String destinationWallet;

    public void mintearPaquete(Integer id) {

        System.out.println("PASO 1");
        validarAdmin();

        System.out.println("PASO 2");
        PaqueteCO2 paquete = paqueteRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Paquete no encontrado"));

        System.out.println("PASO 3");

        if (paquete.getEstado() != EstadoPaquete.APROBADO) {
            throw new RuntimeException(
                    "Solo se pueden mintear paquetes aprobados"
            );
        }

        System.out.println("PASO 4");

        Record record = recordRepo.findByPaqueteId(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No existe Record asociado al paquete"
                        ));

        System.out.println("PASO 5");

        if (record.getIpfsCid() == null ||
                record.getIpfsCid().isBlank()) {

            throw new RuntimeException(
                    "El Record no posee CID de IPFS"
            );
        }

        System.out.println("PASO 6");

        System.out.println("CID: " + record.getIpfsCid());

        blockchainService.mintToken(
                destinationWallet,
                paquete.getTonCO2eq(),
                record.getIpfsCid()
        );

        System.out.println("PASO 7");

        paquete.setEstado(EstadoPaquete.MINTEADO);

        paqueteRepo.save(paquete);

        System.out.println("PASO 8");
    }

    private void validarAdmin() {

        var auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) {
            throw new RuntimeException("Usuario no autenticado");
        }

        Jwt jwt = jwtAuth.getToken();

        System.out.println("JWT CLAIMS: " + jwt.getClaims());

        List<String> roles = jwt.getClaimAsStringList("roles");

        if (roles == null ||
                roles.stream()
                        .noneMatch(r ->
                                r.equalsIgnoreCase("ADMIN"))) {

            throw new RuntimeException(
                    "Acceso solo para administradores"
            );
        }
    }
}