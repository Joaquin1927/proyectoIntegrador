import { useEffect, useMemo, useState } from "react";
import * as ethers from "ethers";
import { useCO2X } from "../web3/useCO2X";
import { useToast } from "../ui/Toaster";
import { toastMessageFromError, logEthersError } from "../utils/errors";
import '../styles/mintform.css';
 
export default function MintForm({
  symbol = "CO2X",
  decimals: decimalsProp,
  integerOnly = false,
  explorerTxBase,
  onMinted,
}) {
  const {
    account,
    contract,         
    paused,
    isPrivileged,
    checkCertIdUsed,
    decimals: hookDecimals,
    mint,
  } = useCO2X();
 
  const toast = useToast();
 
  const DEFAULT_EXPLORER =
    import.meta.env.VITE_EXPLORER_BASE || "https://www.oklink.com/amoy";
 
  const mkTxLink = (hash) => {
    const base = explorerTxBase || DEFAULT_EXPLORER;
    // si ya viene con /tx/... no duplicar
    if (base.includes("/tx/")) return `${base}${base.endsWith("/") ? "" : "/"}${hash}`;
    return `${base.replace(/\/$/, "")}/tx/${hash}`;
  };
 
  const [decimals, setDecimals] = useState(
    typeof decimalsProp === "number" ? decimalsProp : 18
  );
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [certId, setCertId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState("");
 
  useEffect(() => {
    if (typeof decimalsProp === "number") return;
    if (hookDecimals != null) setDecimals(Number(hookDecimals));
  }, [decimalsProp, hookDecimals]);
 
  const addrOk = useMemo(() => {
    const t = (to ?? "").trim();
    return t.length > 0 && ethers.isAddress(t);
  }, [to]);
 
  const amtOk = useMemo(() => {
    const raw = (amount ?? "").trim();
    if (raw === "") return false;
    if (integerOnly && raw.includes(".")) return false;
    try {
      const v = ethers.parseUnits(raw, decimals);
      return v > 0n;
    } catch {
      return false;
    }
  }, [amount, decimals, integerOnly]);
 
  const disabled =
    !contract || !account || !addrOk || !amtOk || !(certId ?? "").trim() || submitting;
 
  function humanError(e) {
    const raw = (e?.shortMessage || e?.reason || e?.message || "").toLowerCase();
    if (/contract not initialized/i.test(raw)) return "Contract not initialized. Check address/ABI.";
    if (/provider not initialized|no wallet detected/i.test(raw)) return "Wallet not connected. Please connect your wallet.";
    if (/wrong network/i.test(raw)) return "Wrong network. Switch to Polygon Amoy (80002).";
    if (e?.code === -32002) return "Your wallet has another pending request. Close/unlock MetaMask and try again.";
    if (/user rejected/.test(raw)) return "Transaction rejected in wallet.";
    if (/insufficient funds/.test(raw)) return "Insufficient funds for gas.";
    if (/nonce too low/.test(raw)) return "Nonce too low. Wait for the previous tx or retry.";
    if (/replacement/.test(raw) && /underpriced/.test(raw)) return "Replacement underpriced. Retry in a few seconds.";
    if (/paused/.test(raw)) return "Contract is paused.";
    if (/onlyowner|not owner|caller is not the owner|only verifier/.test(raw)) return "Only owner/verifier can mint.";
    if (/timeout|rate|network/i.test(raw)) return "Network busy. Please try again.";
    return e?.shortMessage || e?.reason || e?.message || "Transaction failed.";
  }
 
  const handleMint = async () => {
    if (submitting) return;
    const raw  = (amount ?? "").trim();
    const cert = (certId ?? "").trim();
 
    if (!account) return toast.error("Connect your wallet.");
    if (!to) return toast.error("Enter recipient address.");
    if (!raw) return toast.error("Enter an amount.");
    if (!cert) return toast.error("Enter certId (string).");
    if (!ethers.isAddress(to)) return toast.error("Invalid recipient address.");
    if (integerOnly && raw.includes(".")) return toast.error("This token only accepts integer amounts (1, 2, 3…).");
 
    setSubmitting(true);
    setTxHash("");
 
    try {
      // Solo verifier puede mintear
      const v = await contract.verifier().catch(() => null);
      const isVerifier = v && v.toLowerCase() === account.toLowerCase();
      if (!isVerifier) return toast.error(`Your account is not the verifier. Verifier is ${v || "unknown"}.`);
 
      // Paused?
      const isPaused = await paused().catch(() => false);
      if (isPaused) return toast.error("Contract is paused.");
 
      // certId usado?
      if (import.meta.env.VITE_CERTID_CHECK !== "false") {
        const fromBlockEnv = Number(import.meta?.env?.VITE_DEPLOY_BLOCK || 0);
        const fromBlock = Number.isFinite(fromBlockEnv) && fromBlockEnv > 0 ? BigInt(fromBlockEnv) : undefined;
        const certCheck = await checkCertIdUsed(cert, { fromBlock }).catch(() => ({ used: false }));
        if (certCheck.used) return toast.error(`certId already used in ${certCheck.txHash?.slice(0,10)}…`);
      }
 
      toast.info("Submitting mint…");
      const receipt = await mint(to, raw, cert);
 
      const hash = receipt?.transactionHash || receipt?.hash || "";
      if (hash) setTxHash(hash);
 
      try {
        const iface = new ethers.Interface([
          "event Transfer(address indexed from, address indexed to, uint256 value)"
        ]);
        const topic = iface.getEvent("Transfer").topicHash;
        const contractAddr = (contract?.target || contract?.address || "").toLowerCase();
        const logs = (receipt.logs || []).filter(
          (l) => l.address?.toLowerCase() === contractAddr && l.topics?.[0] === topic
        );
        const fromZeroTopic = "0x".padEnd(66, "0");
        const mintLog = logs.find((l) => (l.topics?.[1] || "").toLowerCase() === fromZeroTopic);
        const parsed = mintLog ? iface.parseLog(mintLog) : null;
        const value = parsed?.args?.[2];
        if (value != null) {
          const pretty = ethers.formatUnits(value, decimals);
          toast.success(`Mint confirmed ✅ +${pretty} ${symbol}`);
        } else {
          toast.success("Mint confirmed ✅");
        }
      } catch {
        toast.success("Mint confirmed ✅");
      }
 
      onMinted?.({ to, amount: raw, certId: cert, hash });
    } catch (e) {
      logEthersError(e, { op: "mint", to, certId });
      toast.error(humanError(e) || toastMessageFromError(e));
    } finally {
      setSubmitting(false);
    }
  };
 
  const fillMe = () => { if (account) setTo(account); };
 
  return (
    <div className="panel">
      <h3 className="panel-title">Owner / Verifier · Mint</h3>
 
      <div className="form-vertical">
        {/* Address + shortcut */}
        <div className="form-grid-addr">
          <input
            className="input"
            placeholder="Recipient 0x…"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            autoComplete="off"
          />
          <button onClick={fillMe} className="btn btn--ghost">Use my wallet</button>
        </div>
        {!addrOk && (to ?? "").trim().length > 0 && (
          <small className="field-error">Invalid address.</small>
        )}
 
        {/* Amount + action */}
        <div className="form-grid-amt">
          <input
            className="input"
            placeholder={integerOnly ? `Integer amount (${symbol})` : `Amount (${symbol})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="text"
            inputMode={integerOnly ? "numeric" : "decimal"}
          />
          <button
            onClick={handleMint}
            disabled={disabled}
            className={`btn btn--gold ${disabled ? "btn--disabled" : ""}`}
          >
            {submitting ? "Minting…" : "Mint"}
          </button>
        </div>
 
        {/* certId input */}
        <input
          className="input"
          placeholder="certId (string)"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
        />
        <small className="muted">
          On-chain function: <b>mint(address,uint256,string)</b>.
        </small>
 
        {/* Result */}
        {txHash && (
          <div className="txbox">
            ✅ Mint submitted:{" "}
            <a href={mkTxLink(txHash)} target="_blank" rel="noreferrer" className="txlink">
              {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}