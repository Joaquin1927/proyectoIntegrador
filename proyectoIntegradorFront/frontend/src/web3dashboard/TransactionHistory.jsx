import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useCO2X } from "../web3/useCO2X";
 
export default function TransactionHistory() {
  const { provider, contract, account, chainId, getTransferHistory, subscribeTransfers } = useCO2X();
  const [rows, setRows] = useState([]);
  const [decimals, setDecimals] = useState(18);
 
  const storageKey = useMemo(
    () => (account && chainId ? `co2x:hist:${chainId}:${account.toLowerCase()}` : null),
    [account, chainId]
  );
 
  // Cargar rápido desde localStorage
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) queueMicrotask(() => setRows(JSON.parse(raw)));
    } catch (error) {
      console.warn("No se pudo recuperar el historial local", error);
    }
  }, [storageKey]);
 
  // Fetch inicial desde cadena
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!provider || !contract || !account) return;
      const dec = await contract.decimals().catch(() => 18);
      if (!mounted) return;
      setDecimals(Number(dec));
 
      const latest = await provider.getBlockNumber().catch(() => 0);
      const fromBlock = latest > 200_000 ? latest - 200_000 : 0;
 
      const hist = await getTransferHistory(account, { fromBlock, toBlock: "latest" }).catch(() => []);
      if (!mounted) return;
 
      setRows((prev) => mergeDedupe([...prev, ...mapToRows(hist, Number(dec))]).sort(sorter));
    })();
    return () => { mounted = false; };
  }, [provider, contract, account, getTransferHistory]);
 
  // Suscripción en vivo
  useEffect(() => {
    if (!account) return;
    const off = subscribeTransfers(account, (ev) => {
      setRows((prev) => {
        const next = mergeDedupe([...prev, mapToRow(ev, decimals)]).sort(sorter);
        if (storageKey) {
          try { localStorage.setItem(storageKey, JSON.stringify(next)); }
          catch (error) { console.warn("No se pudo guardar el historial local", error); }
        }
        return next;
      });
    });
    return () => off?.();
  }, [account, subscribeTransfers, storageKey, decimals]);
 
  // Persistencia
  useEffect(() => {
    if (!storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(rows)); }
    catch (error) { console.warn("No se pudo guardar el historial local", error); }
  }, [rows, storageKey]);
 
  // Export CSV
  const exportCSV = () => {
    const header = ["Time","Type","From","To","Amount","Tx","Block"].join(",");
    const lines = rows.map(r =>
      [r.time, r.type, r.from, r.to, r.value, r.tx, r.block].join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "co2x_history.csv"; a.click();
    URL.revokeObjectURL(url);
  };
 
  const explorerBase =
    chainId === 80002
      ? "https://amoy.polygonscan.com/tx/"
      : "https://polygonscan.com/tx/";
 
  return (
    <section className="chain-panel history-panel">
      <div className="history-panel__header">
        <div><span className="chain-eyebrow">ACTIVIDAD ON-CHAIN</span><h2>Historial de transacciones</h2></div>
        <button onClick={exportCSV} className="chain-secondary-action" disabled={rows.length === 0}>Exportar CSV</button>
      </div>
      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              {["Time","Type","From","To","Amount","Tx"].map(h=>(
                <th key={h}>{translateHeader(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={`${r.tx}:${r.block}:${r.idx ?? i}`}>
                <td>{r.time}</td>
                <td><span className={`tx-type tx-type--${r.type.toLowerCase()}`}>{r.type}</span></td>
                <td><Short a={r.from}/></td>
                <td><Short a={r.to}/></td>
                <td>
                  {Number(r.value).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </td>
                <td>
                  <a href={`${explorerBase}${r.tx}`} target="_blank" rel="noreferrer" className="history-tx-link">
                    {r.tx.slice(0,10)}…
                  </a>
                </td>
              </tr>
            ))}
            {rows.length===0 && (
              <tr><td className="history-empty" colSpan={6}>Todavía no hay actividad para esta wallet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
 
function mapToRows(list, dec) { return list.map(ev => mapToRow(ev, dec)); }
function mapToRow(ev, dec) {
  const type =
    ev.from === ethers.ZeroAddress ? "MINT" :
    ev.to === ethers.ZeroAddress ? "BURN" : "TRANSFER";
  const ts = ev.timestamp ? new Date(ev.timestamp * 1000) : new Date();
  return {
    time: ts.toLocaleString(),
    type,
    from: ev.from,
    to: ev.to,
    value: ethers.formatUnits(ev.value, dec),
    tx: ev.txHash,
    block: ev.blockNumber,
    idx: ev.logIndex ?? 0,
  };
}
function mergeDedupe(arr) {
  const map = new Map();
  for (const it of arr) {
    const key = `${it.tx}:${it.block}:${it.idx ?? 0}`;
    map.set(key, it);
  }
  return Array.from(map.values());
}
function sorter(a,b) {
  // Más reciente primero
  return (b.block - a.block) || ((b.idx ?? 0) - (a.idx ?? 0));
}
 
const Short = ({a}) => <span title={a}>{a.slice(0,6)}…{a.slice(-4)}</span>;
 
function translateHeader(header) {
  return ({ Time: "Fecha", Type: "Tipo", From: "Origen", To: "Destino", Amount: "Cantidad", Tx: "Transacción" })[header] || header;
}
 
