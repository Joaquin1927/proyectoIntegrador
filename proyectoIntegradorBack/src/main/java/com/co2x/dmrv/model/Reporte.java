package com.co2x.dmrv.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Reporte implements Observable{
    private final List<Observador> observadores = new ArrayList<>();

    @Override
    public void agregarObservador(Observador observador) {
        observadores.add(observador);
    }

    @Override
    public void quitarObservador(Observador observador) {
        observadores.remove(observador);
    }

    @Override
    public void notificarObservadores() {
        for (Observador observador : observadores) {
            observador.actualizar(this);
        }
    }
}