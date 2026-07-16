import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { ArrowRight, CheckCircle2, ExternalLink, Send, Wallet } from "lucide-react";
import { useCO2X } from "../web3/useCO2X";
import { logEthersError, toastMessageFromError } from "../utils/errors";
import { useToast } from "../ui/Toaster";

export default function AdminTransferPanel({ balance, symbol = "CO2X", integerOnly, onTransferred }) {
  const { account, chainId, transfer, simulateTransfer } = useCO2X();
  const toast = useToast();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const recipientValid = useMemo(
    () => recipient.trim() !== "" && ethers.isAddress(recipient.trim()),
    [recipient]
  );
  const amountValid = useMemo(() => {
    if (!amount.trim()) return false;
    if (integerOnly && /[.,]/.test(amount)) return false;
    const parsed = Number(amount);
    return Number.isFinite(parsed) && parsed > 0 && parsed <= Number(balance || 0);
  }, [amount, balance, integerOnly]);

  const explorerBase = chainId === 80002
    ? "https://amoy.polygonscan.com/tx/"
    : "https://polygonscan.com/tx/";

  const useMaximum = () => {
    const available = Number(balance || 0);
    if (available > 0) setAmount(integerOnly ? String(Math.floor(available)) : String(available));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!account) return toast.error("Conectá la wallet administradora.");
    if (!recipientValid) return toast.error("La wallet de destino no es válida.");
    if (!amountValid) return toast.error("Ingresá un monto válido dentro del saldo disponible.");

    setSending(true);
    setReceipt(null);
    try {
      await simulateTransfer(recipient.trim(), amount);
      toast.info("Revisá y confirmá la transferencia en tu wallet…");
      const txReceipt = await transfer(recipient.trim(), amount);
      const hash = txReceipt?.transactionHash || txReceipt?.hash || "";
      setReceipt({ hash, recipient: recipient.trim(), amount });
      toast.success("Transferencia confirmada en blockchain");
      setRecipient("");
      setAmount("");
      onTransferred?.(txReceipt);
    } catch (error) {
      logEthersError(error, { op: "admin-transfer", recipient, amount, account });
      toast.error(toastMessageFromError(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="chain-panel transfer-panel">
      <div className="chain-panel__header">
        <div className="chain-panel__icon chain-panel__icon--green"><Send size={19} /></div>
        <div>
          <span className="chain-eyebrow">OPERACIÓN ADMINISTRATIVA</span>
          <h2>Transferir tokens</h2>
          <p>Enviá CO₂X desde la wallet conectada hacia otra dirección.</p>
        </div>
        <div className="balance-chip">
          <Wallet size={15} />
          <span>Disponible</span>
          <strong>{formatToken(balance)} {symbol}</strong>
        </div>
      </div>

      <form className="transfer-form" onSubmit={submit}>
        <label className="chain-field chain-field--wide">
          <span>Wallet de destino</span>
          <input
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="0x…"
            autoComplete="off"
            spellCheck="false"
            aria-invalid={recipient !== "" && !recipientValid}
          />
          {recipient !== "" && !recipientValid && <small>Ingresá una dirección EVM válida.</small>}
        </label>

        <label className="chain-field">
          <span>Monto</span>
          <div className="amount-input">
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              inputMode={integerOnly ? "numeric" : "decimal"}
            />
            <button type="button" onClick={useMaximum}>MAX</button>
          </div>
          <small>{integerOnly ? "Solo se admiten unidades enteras." : "Se admiten decimales."}</small>
        </label>

        <div className="transfer-summary">
          <div><span>Origen</span><code>{shortAddress(account)}</code></div>
          <ArrowRight size={18} />
          <div><span>Destino</span><code>{shortAddress(recipient)}</code></div>
          <div className="transfer-summary__amount"><span>Total</span><strong>{amount || "0"} {symbol}</strong></div>
        </div>

        <button className="chain-primary-action" type="submit" disabled={sending || !recipientValid || !amountValid}>
          {sending ? <><span className="button-spinner" /> Confirmando transferencia</> : <><Send size={17} /> Transferir tokens</>}
        </button>
      </form>

      {receipt && (
        <div className="transfer-receipt">
          <CheckCircle2 size={20} />
          <div>
            <strong>{receipt.amount} {symbol} transferidos</strong>
            <span>A {shortAddress(receipt.recipient)}</span>
          </div>
          {receipt.hash && (
            <a href={`${explorerBase}${receipt.hash}`} target="_blank" rel="noreferrer">
              Ver transacción <ExternalLink size={14} />
            </a>
          )}
        </div>
      )}
    </section>
  );
}

function shortAddress(address) {
  if (!address) return "Sin definir";
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

function formatToken(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("es-UY", { maximumFractionDigits: 4 })
    : "0";
}
