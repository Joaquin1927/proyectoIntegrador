package com.co2x.dmrv.service;

import com.co2x.dmrv.dto.TransferTokenResultDTO;
import com.co2x.dmrv.exceptions.BlockchainOperationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.core.methods.response.EthSendTransaction;

import org.web3j.crypto.Credentials;

import org.web3j.tx.RawTransactionManager;

import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;

import java.math.BigInteger;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;

@Service
public class BlockchainService {

    private static final long CHAIN_ID = 80002L;
    private static final int TOKEN_DECIMALS = 18;
    private static final BigInteger GAS_PRICE = BigInteger.valueOf(30_000_000_000L);

    @Value("${blockchain.rpc.url}")
    private String rpcUrl;

    @Value("${blockchain.private.key}")
    private String privateKey;

    @Value("${blockchain.contract.address}")
    private String contractAddress;

    public String mintToken(String wallet, Double amount, String certId) {
        validateBlockchainConfiguration();
        if (!org.web3j.crypto.WalletUtils.isValidAddress(wallet)) {
            throw new BlockchainOperationException("La wallet de destino configurada no es válida");
        }
        if (amount == null || !Double.isFinite(amount) || amount <= 0) {
            throw new BlockchainOperationException("El monto a mintear debe ser mayor a cero");
        }

        Web3j web3j = Web3j.build(new HttpService(rpcUrl));
        try {
            // =========================
            // CONEXIÓN
            // =========================
            Credentials credentials = Credentials.create(privateKey);

            long chainId = 80002; // AMOY

            RawTransactionManager txManager =
                    new RawTransactionManager(web3j, credentials, chainId);

            // =========================
            // DECIMALES (18)
            // =========================
            BigInteger value = toTokenUnits(BigDecimal.valueOf(amount));

            // =========================
            // FUNCIÓN mint
            // =========================
            Function function = new Function(
                    "mint",
                    Arrays.asList(
                            new Address(wallet),
                            new Uint256(value),
                            new Utf8String(certId)
                    ),
                    Arrays.asList()
            );

            String encodedFunction = FunctionEncoder.encode(function);


            BigInteger gasPrice = BigInteger.valueOf(30_000_000_000L); // 30 gwei
            BigInteger gasLimit = BigInteger.valueOf(300000); // seguro


            // =========================
            // EJECUTAR TX
            // =========================
            EthSendTransaction tx = txManager.sendTransaction(
                    gasPrice,
                    gasLimit,
                    contractAddress,
                    encodedFunction,
                    BigInteger.ZERO
            );

            if (tx.getError() != null) {
                throw new BlockchainOperationException(
                        friendlyBlockchainError(tx.getError().getMessage()));
            }

            String transactionHash = tx.getTransactionHash();

            if (transactionHash == null || transactionHash.isBlank()) {
                throw new BlockchainOperationException("Polygon no devolvió el hash de la transacción");
            }

            System.out.println("🚀 TX HASH: " + transactionHash);
            return transactionHash;

        } catch (BlockchainOperationException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BlockchainOperationException(
                    "No se pudo conectar con Polygon Amoy. Verificá el RPC y volvé a intentar.", exception);
        } finally {
            web3j.shutdown();
        }
    }

    public TransferTokenResultDTO transferToken(String destinationWallet, BigDecimal amount) {
        validateBlockchainConfiguration();
        if (!org.web3j.crypto.WalletUtils.isValidAddress(destinationWallet)) {
            throw new IllegalArgumentException("La wallet de destino no es una dirección EVM válida");
        }

        BigInteger value;
        try {
            value = toTokenUnits(amount);
        } catch (ArithmeticException exception) {
            throw new IllegalArgumentException("El monto admite como máximo 18 decimales", exception);
        }

        if (value.signum() <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a cero");
        }

        Web3j web3j = Web3j.build(new HttpService(rpcUrl));
        try {
            Credentials credentials = Credentials.create(privateKey);
            RawTransactionManager txManager = new RawTransactionManager(web3j, credentials, CHAIN_ID);
            Function function = new Function(
                    "transfer",
                    Arrays.asList(new Address(destinationWallet), new Uint256(value)),
                    Arrays.asList()
            );

            EthSendTransaction transaction = txManager.sendTransaction(
                    GAS_PRICE,
                    BigInteger.valueOf(150_000),
                    contractAddress,
                    FunctionEncoder.encode(function),
                    BigInteger.ZERO
            );

            if (transaction.hasError()) {
                throw new RuntimeException("Blockchain rechazó la transferencia: " + transaction.getError().getMessage());
            }
            String hash = transaction.getTransactionHash();
            if (hash == null || hash.isBlank()) {
                throw new RuntimeException("Blockchain no devolvió el hash de la transferencia");
            }

            return new TransferTokenResultDTO(
                    credentials.getAddress(), destinationWallet, amount, hash);
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new RuntimeException("No se pudo transferir tokens desde la wallet owner", exception);
        } finally {
            web3j.shutdown();
        }
    }

    static BigInteger toTokenUnits(BigDecimal amount) {
        return amount.movePointRight(TOKEN_DECIMALS)
                .setScale(0, RoundingMode.UNNECESSARY)
                .toBigIntegerExact();
    }

    private void validateBlockchainConfiguration() {
        if (rpcUrl == null || rpcUrl.isBlank()) {
            throw new BlockchainOperationException("Falta configurar BLOCKCHAIN_RPC_URL");
        }
        if (privateKey == null || privateKey.isBlank()) {
            throw new BlockchainOperationException("Falta configurar BLOCKCHAIN_PRIVATE_KEY");
        }
        if (!org.web3j.crypto.WalletUtils.isValidAddress(contractAddress)) {
            throw new BlockchainOperationException("BLOCKCHAIN_CONTRACT_ADDRESS no es válida");
        }
    }

    private String friendlyBlockchainError(String message) {
        String detail = message == null ? "respuesta desconocida" : message;
        String normalized = detail.toLowerCase();
        if (normalized.contains("insufficient funds")) {
            return "La wallet owner no tiene suficiente POL para pagar el gas";
        }
        if (normalized.contains("onlyowner") || normalized.contains("not owner") || normalized.contains("verifier")) {
            return "La wallet configurada no tiene permisos para mintear en el contrato";
        }
        if (normalized.contains("nonce")) {
            return "Polygon rechazó el nonce de la transacción. Esperá unos segundos y reintentá";
        }
        return "Polygon rechazó el mint: " + detail;
    }
}
