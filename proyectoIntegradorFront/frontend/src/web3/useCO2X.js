// src/web3/useCO2X.js
import { useEffect, useState, useMemo, useCallback } from "react";
import * as ethers from "ethers";
import { CONTRACT_ADDRESS, ABI } from "./contractConfig";
import { readProvider } from "../utils/provider";

const EXPECTED_CHAIN_ID = Number(import.meta?.env?.VITE_CHAIN_ID || 80002); // Amoy

// ===== Event utils
const TRANSFER_IFACE = new ethers.Interface([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");
const pad32 = (addr) => ethers.zeroPadValue(addr, 32);

// Minted(to, amount, certId) — certId is NOT indexed
const MINTED_IFACE = new ethers.Interface([
  "event Minted(address indexed to, uint256 amount, string certId)",
]);
const MINTED_TOPIC = ethers.id("Minted(address,uint256,string)");

// ===== Helpers / constants
const decodeErr = (e) =>
  e?.shortMessage || e?.info?.error?.message || e?.message || "Unknown error";

const DEPLOY_BLOCK = BigInt(import.meta?.env?.VITE_DEPLOY_BLOCK || 0);
const ENABLE_CERTID_LOG_CHECK = import.meta.env.VITE_CERTID_CHECK !== "false";
const LOG_CHUNK = 10_000n;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
async function retry(fn, times = 3, base = 300) {
  let last;
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
    }
    await sleep(base * 2 ** i);
  }
  throw last;
}

export function useCO2X() {
  const [provider, setProvider] = useState(null);  // BrowserProvider (MetaMask)
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [decimals, setDecimals] = useState(18);
  const [chainId, setChainId] = useState(null);

  // ===== contratos
  const readContract = useMemo(() => {
    if (!CONTRACT_ADDRESS) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, readProvider);
  }, []);

  // --- Guardas de negocio ---
  const ensureOnExpectedChain = useCallback(async () => {
    if (!provider) throw new Error("No wallet detected");
    const net = await provider.getNetwork();
    const cid = Number(net.chainId);
    if (cid !== EXPECTED_CHAIN_ID) {
      const err = new Error(`Wrong network. chainId=${cid}, expected=${EXPECTED_CHAIN_ID}`);
      err.code = "WRONG_NETWORK";
      throw err;
    }
  }, [provider]);

  const requireBalanceAtLeast = useCallback(async (addr, amountWei) => {
    if (!readContract) throw new Error("Contract not initialized");
    const bal = await readContract.balanceOf(addr);
    if (bal < amountWei) {
      const err = new Error("ERC20InsufficientBalance");
      err.code = "INSUFFICIENT_TOKEN_BALANCE";
      throw err;
    }
  }, [readContract]);

  const requirePrivilegedAccount = useCallback(async (addr) => {
    if (!readContract) throw new Error("Contract not initialized");
    const [own, ver] = await Promise.all([readContract.owner(), readContract.verifier()]);
    const a = (addr ?? "").toLowerCase();
    const isOwner = own.toLowerCase() === a;
    const isVerifier = ver.toLowerCase() === a;
    if (!isOwner && !isVerifier) {
      const err = new Error("Not verifier");
      err.code = "NOT_PRIVILEGED";
      throw err;
    }
  }, [readContract]);

  const contract = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }, [signer]);

  // ===== Single-tx semaphore
  const sendingRef = useMemo(() => ({ sending: false }), []);
  const sendOne = useCallback(
    async (attempt) => {
      if (sendingRef.sending) throw new Error("There is a pending transaction.");
      sendingRef.sending = true;
      try {
        return await attempt();
      } finally {
        sendingRef.sending = false;
      }
    },
    [sendingRef]
  );

  // ===== Provider bootstrap + sync (MetaMask)
  useEffect(() => {
    if (!window.ethereum) return;
    const _provider = new ethers.BrowserProvider(window.ethereum, "any");
    setProvider(_provider);

    const sync = async () => {
      try {
        const net = await _provider.getNetwork();
        setChainId(Number(net.chainId));
        const accs = await _provider.send("eth_accounts", []);
        if (accs.length > 0) {
          const s = await _provider.getSigner();
          setSigner(s);
          setAccount(accs[0]);
        } else {
          setSigner(null);
          setAccount(null);
        }
      } catch {}
    };
    sync();

    const onChainChanged = () => sync();
    const onAccountsChanged = (accs = []) => {
      if (accs.length > 0) {
        setAccount(accs[0]);
        _provider.getSigner().then(setSigner).catch(() => setSigner(null));
      } else {
        setAccount(null);
        setSigner(null);
      }
    };
    const onDisconnect = () => {
      setSigner(null);
      setAccount(null);
    };

    window.ethereum?.on?.("chainChanged", onChainChanged);
    window.ethereum?.on?.("accountsChanged", onAccountsChanged);
    window.ethereum?.on?.("disconnect", onDisconnect);
    return () => {
      window.ethereum?.removeListener?.("chainChanged", onChainChanged);
      window.ethereum?.removeListener?.("accountsChanged", onAccountsChanged);
      window.ethereum?.removeListener?.("disconnect", onDisconnect);
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) throw new Error("No wallet detected");
    const _provider = new ethers.BrowserProvider(window.ethereum, "any");
    const accounts = await _provider.send("eth_requestAccounts", []);
    const s = await _provider.getSigner();
    setProvider(_provider);
    setSigner(s);
    setAccount(accounts[0]);
    const net = await _provider.getNetwork();
    setChainId(Number(net.chainId));
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    // No anulamos provider para que los listeners sigan activos
    // setProvider(null);
  };

  // ===== decimals desde readContract
  useEffect(() => {
    (async () => {
      try {
        if (readContract) {
          const d = await readContract.decimals();
          setDecimals(Number(d));
        }
      } catch {}
    })();
  }, [readContract]);

  // ===== RPC / gas / signer helpers (lecturas por readProvider)
  const getFeeDataSafe = useCallback(async () => {
    try {
      const fd = await retry(() => readProvider.getFeeData(), 3, 200);
      if (fd?.maxFeePerGas && fd?.maxPriorityFeePerGas) {
        return { maxFeePerGas: fd.maxFeePerGas, maxPriorityFeePerGas: fd.maxPriorityFeePerGas };
      }
      if (fd?.gasPrice) return { gasPrice: fd.gasPrice };

      try {
        const latest = await readProvider.getBlock("latest");
        const base = latest?.baseFeePerGas ?? ethers.parseUnits("30", "gwei");
        const tip = ethers.parseUnits("2", "gwei");
        return { maxFeePerGas: base * 2n + tip, maxPriorityFeePerGas: tip };
      } catch {}
      return {};
    } catch { return {}; }
  }, []);

  const estimateGasSafe = useCallback(async (fn, fallback = 500000n) => {
    try {
      return await retry(fn, 3, 300);
    } catch {
      return fallback;
    }
  }, []);

  const warmupRpc = useCallback(async () => {
    try { await readProvider.getBlockNumber(); } catch {}
  }, []);

  const ensureInteractive = useCallback(async () => {
    if (!provider) throw new Error("Provider not initialized");
    const accs = await provider.send("eth_accounts", []);
    if (!accs || accs.length === 0) {
      await provider.send("eth_requestAccounts", []);
    }
  }, [provider]);

  const getFreshSigner = useCallback(async () => {
    if (!provider) throw new Error("Provider not initialized");
    const s = await provider.getSigner();
    const addr = await s.getAddress();
    setSigner(s);
    setAccount(addr);
    return s;
  }, [provider]);

  const getNativeBalance = useCallback(async (addr) => {
    if (!addr) return 0n;
    return await readProvider.getBalance(addr);
  }, []);

  const ensureReady = useCallback(async () => {
    if (!window.ethereum) throw new Error("No wallet detected");
    if (!provider) throw new Error("Provider not initialized");
    const net = await provider.getNetwork();
    setChainId(Number(net.chainId));
    if (Number(net.chainId) !== EXPECTED_CHAIN_ID) {
      throw new Error(`Wrong network. chainId=${Number(net.chainId)}, expected=${EXPECTED_CHAIN_ID}`);
    }
    if (!signer || !account) throw new Error("Connect your wallet first");
  }, [provider, signer, account]);

  // ===== Strict integers (si tu token no permite fracciones)
  const toUnits = useCallback(
    (amountStr) => {
      if (amountStr == null || amountStr === "")
        throw new Error("Amount must be greater than zero");
      if (String(amountStr).includes(".") || String(amountStr).includes(",")) {
        throw new Error("This token only accepts integer amounts (1, 2, 3…).");
      }
      const amt = ethers.parseUnits(String(amountStr), decimals);
      const ONE = 10n ** BigInt(decimals);
      if (amt % ONE !== 0n)
        throw new Error("This token only accepts integer amounts (1, 2, 3…).");
      return amt;
    },
    [decimals]
  );

  // ===== Reads / guards (todas con readContract)
  const requireNotPaused = useCallback(async () => {
    if (!readContract) return;
    const p = await readContract.paused();
    if (p) throw new Error("Pausable: paused");
  }, [readContract]);

  const paused = useCallback(async () => {
    if (!readContract) throw new Error("Contract not initialized");
    return await readContract.paused();
  }, [readContract]);

  const owner = useCallback(async () => {
    if (!readContract) throw new Error("Contract not initialized");
    return await readContract.owner();
  }, [readContract]);

  const balanceOf = useCallback(async (addr) => {
    if (!readContract) throw new Error("Contract not initialized");
    return await readContract.balanceOf(addr);
  }, [readContract]);

  const isPrivileged = useCallback(async (addr) => {
    if (!readContract) throw new Error("Contract not initialized");
    const [own, ver] = await Promise.all([readContract.owner(), readContract.verifier()]);
    const a = (addr ?? "").toLowerCase();
    return own.toLowerCase() === a || ver.toLowerCase() === a;
  }, [readContract]);

  // ===== Off-chain log-based certId check (solo lectura, sin exigir wallet)
  const checkCertIdUsed = useCallback(
    async (certId, { fromBlock, toBlock = "latest" } = {}) => {
      if (!ENABLE_CERTID_LOG_CHECK) return { used: false };

      let latestBn;
      try {
        latestBn = BigInt(await readProvider.getBlockNumber());
      } catch {
        return { used: false };
      }

      let start =
        typeof fromBlock === "bigint"
          ? fromBlock
          : DEPLOY_BLOCK > 0n
          ? DEPLOY_BLOCK
          : latestBn > 200_000n
          ? latestBn - 200_000n
          : 0n;

      const parseLogs = (logs) => {
        for (const log of logs) {
          try {
            const { args } = MINTED_IFACE.parseLog(log);
            const seen = String(args[2] ?? "");
            if (seen === certId) {
              return {
                used: true,
                txHash: log.transactionHash,
                blockNumber: Number(log.blockNumber),
              };
            }
          } catch {}
        }
        return null;
      };

      const shouldSoften = (e) => {
        const msg = e?.info?.error?.message || e?.message || "";
        return (
          e?.status === 400 ||
          String(e?.code) === "-32603" ||
          /invalid param|response size|too large|block range|bad request|rate limit|400/i.test(msg)
        );
      };

      let slices = 0;
      const MAX_SLICES = 60;

      try {
        while (start <= latestBn && slices < MAX_SLICES) {
          const chunkEnd = start + LOG_CHUNK > latestBn ? latestBn : start + LOG_CHUNK;
          const filter = {
            address: CONTRACT_ADDRESS,
            fromBlock: start,
            toBlock: chunkEnd,
            topics: [MINTED_TOPIC],
          };

          try {
            const logs = await readProvider.getLogs(filter);
            const hit = parseLogs(logs);
            if (hit) return hit;
          } catch (e) {
            if (shouldSoften(e)) {
              const smallChunk = 2_000n;
              let i = start;
              let triedSmall = false;
              while (i <= chunkEnd) {
                const smallEnd = i + smallChunk > chunkEnd ? chunkEnd : i + smallChunk;
                const smallFilter = {
                  address: CONTRACT_ADDRESS,
                  fromBlock: i,
                  toBlock: smallEnd,
                  topics: [MINTED_TOPIC],
                };
                try {
                  const logs = await readProvider.getLogs(smallFilter);
                  const hit = parseLogs(logs);
                  if (hit) return hit;
                  triedSmall = true;
                } catch {}
                i = smallEnd + 1n;
              }
              if (!triedSmall) {
                return { used: false };
              }
            } else {
              return { used: false };
            }
          }

          start = chunkEnd + 1n;
          try { latestBn = BigInt(await readProvider.getBlockNumber()); } catch {}
          slices++;
        }
        return { used: false };
      } catch {
        return { used: false };
      }
    },
    []
  );

  // ===== Simulations (no gas) con readContract
  const simulateTransfer = useCallback(
    async (to, amountStr) => {
      try {
        await ensureReady();
        await requireNotPaused();
        if (!ethers.isAddress((to ?? "").trim())) {
          throw new Error("Invalid recipient address");
        }
        const amt = toUnits(amountStr);
        await requireBalanceAtLeast(account, amt);
        await contract.transfer.staticCall(to, amt);
        return amt;
      } catch (e) {
        throw e; // deja que el UI lo traduzca con FRIENDLY_MAP
      }
    },
    [account, contract, ensureReady, requireNotPaused, toUnits, requireBalanceAtLeast]
  );

  const simulateBurn = useCallback(
    async (amountStr) => {
      try {
        await ensureReady();
        await requireNotPaused();
        const amt = toUnits(amountStr);
        await requireBalanceAtLeast(account, amt);
        await contract.burn.staticCall(amt);
        return amt;
      } catch (e) {
        throw e;
      }
    },
    [account, contract, ensureReady, requireNotPaused, toUnits, requireBalanceAtLeast]
  );

  const simulateMint = useCallback(
    async (to, amountStr, certId) => {
      try {
        await ensureReady();
        await requireNotPaused();
        if (!ethers.isAddress((to ?? "").trim()))
          throw new Error("Invalid recipient address");
        const cert = (certId ?? "").trim();
        if (!cert) throw new Error("Enter certId (string)");
        await requirePrivilegedAccount(account);
        const amt = toUnits(amountStr);
        await contract.mint.staticCall(to, amt, cert);
        return amt;
      } catch (e) {
        throw e;
      }
    },
    [account, contract, ensureReady, requireNotPaused, toUnits, requirePrivilegedAccount]
  );

  // ===== Aggressive EIP-1559 fees (Polygon/Amoy) =====
  const GWEI = (n) => ethers.parseUnits(String(n), "gwei");
  const TIP_GWEI = Number(import.meta.env.VITE_TIP_GWEI || 30);
  const MAXFEE_FLOOR_GWEI = Number(import.meta.env.VITE_MAXFEE_FLOOR_GWEI || 200);

  const computeAggressiveFees = useCallback(async () => {
    const p = provider || readProvider;
    try {
      const latest = await p.getBlock("latest");
      const base = latest?.baseFeePerGas ?? GWEI(30);
      const tip  = GWEI(TIP_GWEI);
      let maxFee = base * 2n + tip;
      const floor = GWEI(MAXFEE_FLOOR_GWEI);
      if (maxFee < floor) maxFee = floor;
      return { maxFeePerGas: maxFee, maxPriorityFeePerGas: tip };
    } catch {
      return { gasPrice: GWEI(60) };
    }
  }, [provider]);

  function bumpFees(fees) {
    if ("gasPrice" in fees) {
      return { gasPrice: fees.gasPrice * 2n };
    }
    return {
      maxFeePerGas: fees.maxFeePerGas * 2n,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas * 2n,
    };
  }

  // ===== Transactions (firmadas) con contract (signer)
  const transfer = useCallback(
    async (to, amountStr) => {
      await ensureReady();
      await warmupRpc();
      await ensureInteractive();
      await getFreshSigner();

      const native = await getNativeBalance(account);
      if (native < 1_000_000_000_000_000n) {
        throw new Error("insufficient funds"); // para FRIENDLY_MAP
      }

      const amt = await simulateTransfer(to, amountStr);

      let est;
      try { est = await contract.estimateGas.transfer(to, amt); }
      catch { est = 150000n; }
      const gasLimit = ((est * 120n) / 100n) > 150000n ? ((est * 120n) / 100n) : 150000n;

      const fees1 = await computeAggressiveFees();

      return await sendOne(async () => {
        try {
          const tx = await contract.transfer(to, amt, { gasLimit, ...fees1 });
          return await tx.wait(1);
        } catch (e1) {
          const fees2 = bumpFees(fees1);
          const tx2 = await contract.transfer(to, amt, { gasLimit, ...fees2 });
          return await tx2.wait(1);
        }
      });
    },
    [
      account, contract, ensureReady, warmupRpc, ensureInteractive, getFreshSigner,
      getNativeBalance, simulateTransfer, computeAggressiveFees, sendOne
    ]
  );

  const burn = useCallback(
    async (amountStr) => {
      await ensureReady();
      await warmupRpc();
      await ensureInteractive();
      await getFreshSigner();

      const amt = toUnits(amountStr);

      await requireBalanceAtLeast(account, amt);

      const native = await getNativeBalance(account);
      if (native < 1_000_000_000_000_000n) {
        throw new Error("insufficient funds");
      }

      await simulateBurn(amountStr);

      let est;
      try { est = await contract.estimateGas.burn(amt); }
      catch { est = 300000n; }
      const gasLimit = ((est * 120n) / 100n) > 300000n ? ((est * 120n) / 100n) : 300000n;

      const fees1 = await computeAggressiveFees();

      return await sendOne(async () => {
        try {
          const tx = await contract.burn(amt, { gasLimit, ...fees1 });
          return await tx.wait(1);
        } catch (e1) {
          const fees2 = bumpFees(fees1);
          const tx2 = await contract.burn(amt, { gasLimit, ...fees2 });
          return await tx2.wait(1);
        }
      });
    },
    [
      account, contract, ensureReady, warmupRpc, ensureInteractive, getFreshSigner,
      getNativeBalance, simulateBurn, computeAggressiveFees, sendOne
    ]
  );

  const mint = useCallback(
    async (to, amountStr, certId) => {
      await ensureReady();
      await warmupRpc();
      await ensureInteractive();
      await getFreshSigner();

      const native = await getNativeBalance(account);
      if (native < 1_000_000_000_000_000n) {
        throw new Error("insufficient funds");
      }

      const amt = await simulateMint(to, amountStr, certId);

      let est;
      try { est = await contract.estimateGas.mint(to, amt, (certId ?? "").trim()); }
      catch { est = 1_200_000n; }
      const gasLimit = ((est * 120n) / 100n);
      const gasLimitSafe = gasLimit > 1_200_000n ? gasLimit : 1_200_000n;

      const fees1 = await computeAggressiveFees();

      return await sendOne(async () => {
        try {
          const tx = await contract.mint(to, amt, (certId ?? "").trim(), { gasLimit: gasLimitSafe, ...fees1 });
          return await tx.wait(1);
        } catch (e1) {
          const fees2 = bumpFees(fees1);
          const tx2 = await contract.mint(to, amt, (certId ?? "").trim(), { gasLimit: gasLimitSafe, ...fees2 });
          return await tx2.wait(1);
        }
      });
    },
    [
      account, contract, ensureReady, warmupRpc, ensureInteractive, getFreshSigner,
      getNativeBalance, simulateMint, computeAggressiveFees, sendOne
    ]
  );

  // ===== History (lectura)
  const getTransferHistory = useCallback(async (addr, { fromBlock = 0n, toBlock = "latest" } = {}) => {
    const lower = addr.toLowerCase();
    const inFilter  = { address: CONTRACT_ADDRESS, fromBlock, toBlock, topics: [TRANSFER_TOPIC, null, pad32(addr)] };
    const outFilter = { address: CONTRACT_ADDRESS, fromBlock, toBlock, topics: [TRANSFER_TOPIC, pad32(addr)] };

    const [inLogs, outLogs] = await Promise.all([
      readProvider.getLogs(inFilter),
      readProvider.getLogs(outFilter),
    ]);

    const decode = (log) => {
      const { args } = TRANSFER_IFACE.parseLog(log);
      const from = String(args[0]);
      const to   = String(args[1]);
      const value = args[2];
      const direction = from.toLowerCase() === lower ? "out" : "in";
      const counterparty = direction === "out" ? to : from;
      return {
        direction, from, to, counterparty, value,
        valueFormatted: ethers.formatUnits(value, decimals),
        txHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
        logIndex: Number(log.index ?? log.logIndex ?? 0),
      };
    };

    const merged = [...inLogs, ...outLogs].map(decode).sort((a,b)=>a.blockNumber-b.blockNumber || a.logIndex-b.logIndex);

    const uniqueBlocks = [...new Set(merged.map(m => m.blockNumber))];
    const blocks = await Promise.all(uniqueBlocks.map(bn => readProvider.getBlock(bn)));
    const tsMap = new Map(blocks.map(b => [Number(b.number), Number(b.timestamp)]));
    merged.forEach(m => m.timestamp = tsMap.get(m.blockNumber));

    return merged;
  }, [decimals]);

  // ===== Live subscription (lectura)
  const subscribeTransfers = useCallback((addr, onEvent) => {
    const lower = addr.toLowerCase();
    const inFilter  = { address: CONTRACT_ADDRESS, topics: [TRANSFER_TOPIC, null, pad32(addr)] };
    const outFilter = { address: CONTRACT_ADDRESS, topics: [TRANSFER_TOPIC, pad32(addr)] };

    const handler = async (log) => {
      try {
        const { args } = TRANSFER_IFACE.parseLog(log);
        const from = String(args[0]), to = String(args[1]), value = args[2];
        const direction = from.toLowerCase() === lower ? "out" : "in";
        const counterparty = direction === "out" ? to : from;
        const block = await readProvider.getBlock(log.blockNumber);
        onEvent({
          direction, from, to, counterparty, value,
          valueFormatted: ethers.formatUnits(value, decimals),
          txHash: log.transactionHash,
          blockNumber: Number(log.blockNumber),
          logIndex: Number(log.index ?? log.logIndex ?? 0),
          timestamp: Number(block.timestamp),
        });
      } catch (e) { console.error("parse log error", e); }
    };

    readProvider.on(inFilter, handler);
    readProvider.on(outFilter, handler);
    return () => {
      readProvider.off(inFilter, handler);
      readProvider.off(outFilter, handler);
    };
  }, [decimals]);

  return {
    provider,
    signer,
    account,
    isConnected: !!account,
    chainId,
    decimals,
    contract,          // para escrituras
    connectWallet,
    disconnectWallet,
    // reads / guards
    paused,
    owner,
    balanceOf,
    isPrivileged,
    checkCertIdUsed,
    // simulations
    simulateTransfer,
    simulateBurn,
    simulateMint,
    // transactions
    transfer,
    burn,
    mint,
    // history + live
    getTransferHistory,
    subscribeTransfers,
  };
}