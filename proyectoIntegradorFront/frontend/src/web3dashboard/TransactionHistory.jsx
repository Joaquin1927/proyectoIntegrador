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
      if (raw) setRows(JSON.parse(raw));
    } catch {}
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
          try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
        }
        return next;
      });
    });
    return () => off?.();
  }, [account, subscribeTransfers, storageKey, decimals]);
 
  // Persistencia
  useEffect(() => {
    if (!storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(rows)); } catch {}
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
    <div style={panel}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
        <h3 style={{color:"#DAA520"}}>Transaction History</h3>
        <button onClick={exportCSV} style={btn}>Export CSV</button>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%", borderCollapse:"collapse", color:"#fff"}}>
          <thead>
            <tr>
              {["Time","Type","From","To","Amount","Tx"].map(h=>(
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={`${r.tx}:${r.block}:${r.idx ?? i}`}>
                <td style={td}>{r.time}</td>
                <td style={{...td, color: typeColor(r.type), fontWeight:600}}>{r.type}</td>
                <td style={td}><Short a={r.from}/></td>
                <td style={td}><Short a={r.to}/></td>
                <td style={td}>
                  {Number(r.value).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </td>
                <td style={td}>
                  <a href={`${explorerBase}${r.tx}`} target="_blank" rel="noreferrer" style={{color:"#DAA520"}}>
                    {r.tx.slice(0,10)}…
                  </a>
                </td>
              </tr>
            ))}
            {rows.length===0 && (
              <tr><td style={td} colSpan={6}>No activity yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
 
function typeColor(type) {
  if (type === "MINT") return "#00FF00";
  if (type === "BURN") return "#808080";
  return "#bbb";
}
 
const panel = {
  background: "#1e1e1e",
  borderRadius: 12,
  padding: 16,
  marginTop: 16,
  border: "1px solid #333",
  boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
};
const th = { textAlign:"left", borderBottom:"1px solid #333", padding:"8px", color:"#bbb", fontWeight:600 };
const td = { borderBottom:"1px solid #222", padding:"8px", fontSize:14 };
const btn = { background:"#DAA520", color:"#111", border:"none", padding:"8px 12px", borderRadius:8, fontWeight:700, cursor:"pointer" };
 