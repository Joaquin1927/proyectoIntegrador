package com.co2x.dmrv.exceptions;

public class BlockchainOperationException extends RuntimeException {

    public BlockchainOperationException(String message) {
        super(message);
    }

    public BlockchainOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
