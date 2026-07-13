package com.co2x.dmrv.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.protocol.core.methods.response.EthSendTransaction;

import org.web3j.crypto.Credentials;

import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.gas.DefaultGasProvider;

import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;

import java.math.BigInteger;
import java.util.Arrays;

@Service
public class BlockchainService {

    @Value("${blockchain.rpc.url}")
    private String rpcUrl;

    @Value("${blockchain.private.key}")
    private String privateKey;

    @Value("${blockchain.contract.address}")
    private String contractAddress;

    public String mintToken(String wallet, Double amount, String certId) {

        try {
            // =========================
            // CONEXIÓN
            // =========================
            Web3j web3j = Web3j.build(new HttpService(rpcUrl));

            Credentials credentials = Credentials.create(privateKey);

            long chainId = 80002; // AMOY

            RawTransactionManager txManager =
                    new RawTransactionManager(web3j, credentials, chainId);

            // =========================
            // DECIMALES (18)
            // =========================
            BigInteger value = BigInteger.valueOf(
                    (long) (amount * Math.pow(10, 18))
            );

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
                System.out.println("❌ ERROR BLOCKCHAIN: " + tx.getError().getMessage());
                throw new RuntimeException("Blockchain error: " + tx.getError().getMessage());
            }

            String transactionHash = tx.getTransactionHash();

            if (transactionHash == null || transactionHash.isBlank()) {
                throw new RuntimeException("Blockchain no devolvió el hash de la transacción");
            }

            System.out.println("🚀 TX HASH: " + transactionHash);
            return transactionHash;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error minting token", e);
        }
    }
}
