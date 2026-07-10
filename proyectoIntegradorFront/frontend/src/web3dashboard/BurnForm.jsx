import React, { useState } from "react";
import { useCO2X } from "../web3/useCO2X";
import { toastMessageFromError, logEthersError } from "../utils/errors";
import { useToast } from "../ui/Toaster";
 
export default function BurnForm() {
  const { account, chainId, burn, simulateBurn } = useCO2X();
  const toast = useToast();
 
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState(null);
 
  const explorerTxBase =
    chainId === 80002
      ? "https://amoy.polygonscan.com/tx/"
      : "https://polygonscan.com/tx/";
 
  const handleBurn = async (e) => {
    e.preventDefault();
    setStatus(null);
    setTxHash(null);
 
    if (!account) return setStatus("Connect your wallet.");
    if (!amount) return setStatus("Enter an amount.");
 
    try {
      setSending(true);
      setStatus("Validating…");
 
      await simulateBurn(amount);
      const receipt = await burn(amount);
 
      setTxHash(receipt.transactionHash || receipt.hash);
      setStatus("Burn confirmed 🔥");
      setAmount("");
    } catch (err) {
      logEthersError(err, { op: "burn", account });
      toast.error(toastMessageFromError(err));
      setStatus(null);
    } finally {
      setSending(false);
    }
  };
 
  return (
    <div style={panel}>
      <h3 style={{ color: "#DAA520", marginBottom: "1rem" }}>Burn Tokens</h3>
 
      <form onSubmit={handleBurn}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1"
            style={inputStyle}
          />
 
          <button
            type="submit"
            className="custom-gold-button"
            disabled={sending || !account}
          >
            {sending ? "Burning…" : "Burn"}
          </button>
        </div>
      </form>
 
      {status && (
        <p style={{ marginTop: "1rem", color: "#DAA520" }}>
          {status}{" "}
          {txHash && (
            <a
              href={explorerTxBase + txHash}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#DAA520", textDecoration: "underline" }}
            >
              view on explorer
            </a>
          )}
        </p>
      )}
    </div>
  );
}
 
const panel = {
  background: "#1e1e1e",
  border: "1px solid #333",
  borderRadius: 12,
  padding: 16,
  marginTop: 16,
  boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
};
 
const inputStyle = {
  flex: 1,
  padding: "0.5rem 0.75rem",
  borderRadius: 8,
  border: "1px solid #444",
  backgroundColor: "#2a2a2a",
  color: "#DAA520",
  fontSize: "0.95rem",
};