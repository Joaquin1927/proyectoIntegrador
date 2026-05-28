package com.co2x.dmrv.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String password = body.get("password");

        // TEST SIMPLE
        if(email.equals("admintest@carbontechnologyincCO2X.onmicrosoft.com")
                && password.equals("1234")) {

            return Map.of(
                    "success", true,
                    "token", "fake-jwt-token",
                    "role", "ADMIN"
            );
        }

        throw new RuntimeException("Credenciales inválidas");
    }
}