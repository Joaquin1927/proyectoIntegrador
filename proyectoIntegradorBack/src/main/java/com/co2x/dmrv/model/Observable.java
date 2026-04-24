package com.co2x.dmrv.model;

public interface Observable {
    void agregarObservador(Observador observador);
    void quitarObservador(Observador observador);
    void notificarObservadores();
}
