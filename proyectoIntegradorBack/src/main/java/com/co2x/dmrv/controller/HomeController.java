package com.co2x.dmrv.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;



    @RestController
    public class HomeController {

        @GetMapping("/")
        public String home() {
            return "CO2X API funcionando";
        }
    }
