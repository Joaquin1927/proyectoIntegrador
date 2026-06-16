package com.co2x.dmrv.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class IpfsService {

    @Value("${pinata.api.key}")
    private String apiKey;

    @Value("${pinata.api.secret}")
    private String apiSecret;

    private final String PINATA_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

    public String uploadJSON(String json) {

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("pinata_api_key", apiKey);
        headers.set("pinata_secret_api_key", apiSecret);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(json, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                PINATA_URL,
                HttpMethod.POST,
                entity,
                Map.class
        );

        return (String) response.getBody().get("IpfsHash");
    }
}