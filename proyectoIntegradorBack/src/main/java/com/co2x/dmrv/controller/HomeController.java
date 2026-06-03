package com.co2x.dmrv.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;



    @RestController
    public class HomeController {

        @GetMapping("/")
        public String home() {
            return "PRUEBA JOAQUIN 123456";
        }
        @GetMapping("/test")
        public String test() {
            return "backend actualizado";
        }
    }
