package com.co2x.dmrv;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Co2xApplication {
    static {
        System.out.println("APP ARRANCANDO");
    }

    public static void main(String[] args) {
        SpringApplication.run(Co2xApplication.class, args);
    }
}
