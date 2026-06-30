package com.co2x.dmrv.service.observer;

import com.co2x.dmrv.entity.PaqueteCO2;

public interface PaqueteSubject {
    void addObserver(com.co2x.dmrv.service.observer.PaqueteObserver observer);
    void removeObserver(com.co2x.dmrv.service.observer.PaqueteObserver observer);
    void notifyObservers(PaqueteCO2 paquete);

}