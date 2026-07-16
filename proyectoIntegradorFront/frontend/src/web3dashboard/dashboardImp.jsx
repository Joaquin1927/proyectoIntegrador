import { useEffect, useMemo, useState } from "react";
import * as ethersNS from "ethers";
import { Activity, Database, ExternalLink, Flame, KeyRound, ShieldCheck, WalletCards } from "lucide-react";
import { CONTRACT_ADDRESS, ABI } from "../web3/contractConfig";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AdminTransferPanel from "./AdminTransferPanel";
import { logEthersError } from "../utils/errors";
import { readProvider } from "../utils/provider";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [symbol, setSymbol] = useState("CO2X");
  const [supply, setSupply] = useState(null);
  const [burned, setBurned] = useState(null);
  const [ever, setEver] = useState(null);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerBalance, setOwnerBalance] = useState(null);
  const [paused, setPaused] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const integerOnly = import.meta.env.VITE_INTEGER_ONLY === "true";

  const readContract = useMemo(() => (
    CONTRACT_ADDRESS ? new ethersNS.Contract(CONTRACT_ADDRESS, ABI, readProvider) : null
  ), []);

  useEffect(() => {
    const load = async () => {
      if (!readContract) return;
      try {
        const [sym, dec, stats, isPaused, owner] = await Promise.all([
          readContract.symbol(), readContract.decimals(), readContract.tokenStats(), readContract.paused(), readContract.owner(),
        ]);
        const balanceWei = await readContract.balanceOf(owner);
        setSymbol(sym);
        setSupply(ethersNS.formatUnits(stats.supply, dec));
        setBurned(ethersNS.formatUnits(stats.burned, dec));
        setEver(ethersNS.formatUnits(stats.ever, dec));
        setOwnerAddress(owner);
        setOwnerBalance(ethersNS.formatUnits(balanceWei, dec));
        setPaused(isPaused);
      } catch (error) {
        logEthersError(error, { op: "load-admin-treasury" });
      }
    };
    load();
  }, [readContract, reloadKey]);

  const sup = Number(supply ?? 0);
  const bur = Number(burned ?? 0);
  const chartData = [
    { name: "En circulación", value: Number.isFinite(sup) ? sup : 0 },
    { name: "Retirados", value: Number.isFinite(bur) ? bur : 0 },
  ];

  return (
    <div className="admin-chain-dashboard">
      <div className="admin-chain-shell">
        <header className="admin-chain-hero">
          <div><span className="chain-eyebrow">CO₂X · BLOCKCHAIN CONTROL CENTER</span><h1>Tesorería digital</h1><p>Supervisá el suministro y transferí tokens desde la cuenta owner en Polygon Amoy.</p></div>
          <div className="owner-security-badge"><KeyRound size={18} /><div><span>Firma administrada</span><strong>{shortAddress(ownerAddress)}</strong></div></div>
        </header>

        <div className="chain-environment-note">
          <ShieldCheck size={19} />
          <div><strong>Operaciones protegidas</strong><span>La clave owner permanece en el servidor y nunca se expone en el navegador.</span></div>
          <a href={`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">Ver contrato <ExternalLink size={14} /></a>
        </div>
        {paused && <div className="chain-warning">El contrato está pausado. Las operaciones están temporalmente bloqueadas.</div>}

        <div className="chain-stats-grid">
          <StatCard icon={<Database />} label="Suministro circulante" value={formatValue(supply, symbol)} accent="green" />
          <StatCard icon={<Flame />} label="Tokens retirados" value={formatValue(burned, symbol)} accent="orange" />
          <StatCard icon={<Activity />} label="Emisión histórica" value={formatValue(ever, symbol)} accent="blue" />
          <StatCard icon={<WalletCards />} label="Saldo de la owner" value={formatValue(ownerBalance, symbol)} accent="gold" />
        </div>

        <AdminTransferPanel ownerAddress={ownerAddress} balance={ownerBalance} symbol={symbol} integerOnly={integerOnly} onTransferred={() => setReloadKey((key) => key + 1)} />

        <section className="chain-panel supply-panel">
          <div className="chain-panel__header chain-panel__header--compact"><div><span className="chain-eyebrow">ANALÍTICA</span><h2>Distribución del suministro</h2></div></div>
          <div className="chart-box"><ResponsiveContainer><PieChart><Pie dataKey="value" data={chartData} outerRadius={90} label><Cell fill="#2bd48d" /><Cell fill="#ff9f65" /></Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return <div className={`chain-stat-card chain-stat-card--${accent}`}><div className="chain-stat-card__icon">{icon}</div><div><div className="chain-stat-card__label">{label}</div><div className="chain-stat-card__value">{value}</div></div></div>;
}

function formatValue(value, symbol) {
  return value == null ? "—" : `${Number(value).toLocaleString("es-UY", { maximumFractionDigits: 3 })} ${symbol}`;
}

function shortAddress(address) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Cargando owner…";
}
