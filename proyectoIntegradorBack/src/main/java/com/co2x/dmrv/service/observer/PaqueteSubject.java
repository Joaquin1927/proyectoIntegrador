package com.co2x.dmrv.service.observer;

import com.co2x.dmrv.entity.PaqueteCO2;

public interface PaqueteSubject {
    void addObserver(PaqueteObserver observer);
    void removeObserver(PaqueteObserver observer);
    void notifyObservers(PaqueteCO2 paquete);

}
