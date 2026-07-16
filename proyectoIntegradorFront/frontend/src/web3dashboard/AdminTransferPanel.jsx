import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { ArrowRight, CheckCircle2, ExternalLink, Send, ShieldCheck, Wallet } from "lucide-react";
import { authFetch } from "../api/authFetch";
import { useToast } from "../ui/Toaster";

const API = import.meta.env.VITE_API_URL;
const EXPLORER_TX = "https://amoy.polygonscan.com/tx/";

export default function AdminTransferPanel({ ownerAddress, balance, symbol = "CO2X", integerOnly, onTransferred }) {
  const toast = useToast();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const recipientValid = useMemo(
    () => recipient.trim() !== "" && ethers.isAddress(recipient.trim()),
    [recipient],
  );
  const amountValid = useMemo(() => {
    if (!amount.trim() || (integerOnly && /[.,]/.test(amount))) return false;
    const parsed = Number(amount);
    return Number.isFinite(parsed) && parsed > 0 && parsed <= Number(balance || 0);
  }, [amount, balance, integerOnly]);

  const useMaximum = () => {
    const available = Number(balance || 0);
    if (available > 0) setAmount(integerOnly ? String(Math.floor(available)) : String(available));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!recipientValid) return toast.error("La wallet de destino no es válida.");
    if (!amountValid) return toast.error("Ingresá un monto válido dentro del saldo disponible.");

    setSending(true);
    setReceipt(null);
    try {
      const response = await authFetch(`${API}/blockchain/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationWallet: recipient.trim(), amount }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "No se pudo enviar la transferencia");

      setReceipt(body);
      setRecipient("");
      setAmount("");
      toast.success("Transferencia enviada a Polygon");
      onTransferred?.(body);
    } catch (error) {
      toast.error(error.message || "No se pudo transferir tokens");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="chain-panel transfer-panel">
      <div className="chain-panel__header">
        <div className="chain-panel__icon chain-panel__icon--green"><Send size={19} /></div>
        <div>
          <span className="chain-eyebrow">TESORERÍA ADMINISTRATIVA</span>
          <h2>Transferir tokens</h2>
          <p>La operación se firma de forma segura desde la wallet owner configurada en el servidor.</p>
        </div>
        <div className="balance-chip">
          <Wallet size={15} /><span>Disponible</span>
          <strong>{formatToken(balance)} {symbol}</strong>
        </div>
      </div>

      <div className="server-signing-note">
        <ShieldCheck size={18} />
        <div><strong>Firma protegida por el backend</strong><span>No necesitás conectar MetaMask ni aprobar la transacción desde el navegador.</span></div>
      </div>

      <form className="transfer-form" onSubmit={submit}>
        <label className="chain-field chain-field--wide">
          <span>Wallet de destino</span>
          <input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x…" autoComplete="off" spellCheck="false" aria-invalid={recipient !== "" && !recipientValid} />
          {recipient !== "" && !recipientValid && <small>Ingresá una dirección EVM válida.</small>}
        </label>
        <label className="chain-field">
          <span>Monto</span>
          <div className="amount-input">
            <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" inputMode={integerOnly ? "numeric" : "decimal"} />
            <button type="button" onClick={useMaximum}>MAX</button>
          </div>
          <small>{integerOnly ? "Solo se admiten unidades enteras." : "Se admiten hasta 18 decimales."}</small>
        </label>

        <div className="transfer-summary">
          <div><span>Origen owner</span><code>{shortAddress(ownerAddress)}</code></div>
          <ArrowRight size={18} />
          <div><span>Destino</span><code>{shortAddress(recipient)}</code></div>
          <div className="transfer-summary__amount"><span>Total</span><strong>{amount || "0"} {symbol}</strong></div>
        </div>
        <button className="chain-primary-action" type="submit" disabled={sending || !recipientValid || !amountValid}>
          {sending ? <><span className="button-spinner" /> Firmando y enviando</> : <><Send size={17} /> Transferir desde owner</>}
        </button>
      </form>

      {receipt && (
        <div className="transfer-receipt">
          <CheckCircle2 size={20} />
          <div><strong>{receipt.amount} {symbol} enviados</strong><span>A {shortAddress(receipt.destinationWallet)}</span></div>
          <a href={`${EXPLORER_TX}${receipt.transactionHash}`} target="_blank" rel="noreferrer">Ver transacción <ExternalLink size={14} /></a>
        </div>
      )}
    </section>
  );
}

function shortAddress(address) {
  if (!address) return "Cargando…";
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

function formatToken(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("es-UY", { maximumFractionDigits: 4 }) : "0";
}
