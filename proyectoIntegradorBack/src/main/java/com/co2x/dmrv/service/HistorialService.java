package com.co2x.dmrv.service;

import com.co2x.dmrv.entity.EstadoPaquete;
import com.co2x.dmrv.entity.HistorialPaquete;
import com.co2x.dmrv.entity.PaqueteCO2;
import com.co2x.dmrv.repository.HistorialPaqueteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service

public class HistorialService {
    @Autowired
    private HistorialPaqueteRepository historialRepo;


    private String generarSnapshot(PaqueteCO2 p) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            Map<String, Object> snap = Map.of(
                    "id", p.getId(),
                    "estado", p.getEstado(),
                    "tonCO2eq", p.getTonCO2eq(),
                    "planta", p.getPlanta() != null ? p.getPlanta().getNombre() : null,
                    "metadata", p.getMetadata()
            );

            return mapper.writeValueAsString(snap);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void registrarHistorial(
            PaqueteCO2 paquete,
            String usuario,
            EstadoPaquete accion,
            List<Map<String, Object>> cambios
    ) {

        try {
            ObjectMapper mapper = new ObjectMapper();

            HistorialPaquete h = new HistorialPaquete();

            h.setPaquete(paquete);

            h.setEditor(usuario);
            System.out.println("EDITOR EN REGISTRAR HISTORIAL: "+ h.getEditor());
            h.setAccion(accion);
            h.setFecha(LocalDateTime.now());

            h.setSnapshot(generarSnapshot(paquete));

            if (cambios != null && !cambios.isEmpty()) {
                h.setCambios(mapper.writeValueAsString(cambios));
            } else {
                h.setCambios("[]");
            }

            String snapshot = generarSnapshot(paquete);

            System.out.println("LARGO SNAPSHOT: " + snapshot.length());

            String cambiosJson = cambios != null
                    ? mapper.writeValueAsString(cambios)
                    : "[]";

            System.out.println("LARGO CAMBIOS: " + cambiosJson.length());

            historialRepo.save(h);

            System.out.println("✅ Historial guardado correctamente");

        } catch (Exception e) {
            System.out.println("💥 ERROR EN registrarHistorial:");
            e.printStackTrace();
        }
    }


    public int obtenerNumeroRevision(Integer paqueteId) {

        List<HistorialPaquete> historial =
                historialRepo.findByPaqueteId(paqueteId);

        long revisiones =
                historial.stream()
                        .filter(h ->
                                h.getAccion() == EstadoPaquete.EN_REVISION
                        )
                        .count();

        return (int) revisiones + 1;
    }


    public Optional<HistorialPaquete> obtenerUltimoHistorial(Integer id) {
        return historialRepo.findTopByPaqueteIdOrderByFechaDesc(id);
    }
}
