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
    <section className="chain-panel burn-panel">
      <div className="chain-panel__header chain-panel__header--compact">
        <div><span className="chain-eyebrow">RETIRO PERMANENTE</span><h2>Retirar tokens</h2><p>La quema reduce de forma irreversible el suministro circulante.</p></div>
      </div>
 
      <form onSubmit={handleBurn} className="burn-form">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Cantidad a retirar"
            className="input"
          />
 
          <button
            type="submit"
            className="chain-danger-action"
            disabled={sending || !account}
          >
            {sending ? "Retirando…" : "Retirar tokens"}
          </button>
      </form>
 
      {status && (
        <p className="burn-status">
          {status}{" "}
          {txHash && (
            <a
              href={explorerTxBase + txHash}
              target="_blank"
              rel="noreferrer"
            >
              ver en el explorador
            </a>
          )}
        </p>
      )}
    </section>
  );
}
