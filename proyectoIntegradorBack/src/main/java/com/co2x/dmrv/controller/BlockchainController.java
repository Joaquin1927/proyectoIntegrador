package com.co2x.dmrv.controller;

import com.co2x.dmrv.dto.TransferTokenRequestDTO;
import com.co2x.dmrv.dto.TransferTokenResultDTO;
import com.co2x.dmrv.service.BlockchainService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/blockchain")
public class BlockchainController {

    private final BlockchainService blockchainService;

    public BlockchainController(BlockchainService blockchainService) {
        this.blockchainService = blockchainService;
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransferTokenResultDTO> transfer(
            @Valid @RequestBody TransferTokenRequestDTO request) {
        return ResponseEntity.ok(blockchainService.transferToken(
                request.destinationWallet(), request.amount()));
    }
}
