// src/components/web3dashboard/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import * as ethersNS from "ethers";
import { Activity, CircleDollarSign, Database, ExternalLink, Flame, ShieldCheck, WalletCards } from "lucide-react";
import { useCO2X } from "../web3/useCO2X";
import { CONTRACT_ADDRESS, ABI } from "../web3/contractConfig";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import TransactionHistory from "./TransactionHistory";
import BurnForm from "./BurnForm";
import MintForm from "./mintForm";
import AdminTransferPanel from "./AdminTransferPanel";
import { useToast } from "../ui/Toaster";
import { withTx } from "../utils/tx";
import { logEthersError } from "../utils/errors";
import { readProvider } from "../utils/provider";
import ConnectWalletButton from '../components/ConnectWalletButton';
import '../styles/dashboard.css';
 
export default function Dashboard() {
  const { account, chainId } = useCO2X();
 
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(18);
  const [supply, setSupply] = useState(null);
  const [burned, setBurned] = useState(null);
  const [ever, setEver] = useState(null);
  const [balance, setBalance] = useState(null);
  const [userBurned, setUserBurned] = useState(null);
  const [paused, setPaused] = useState(false);
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
 
  const toast = useToast();
 
  // integerOnly fijo por .env
  const integerOnly = import.meta.env.VITE_INTEGER_ONLY === "true";
 
  // Contrato SOLO LECTURA
  const readContract = useMemo(() => {
    if (!CONTRACT_ADDRESS) return null;
    return new ethersNS.Contract(CONTRACT_ADDRESS, ABI, readProvider);
  }, []);
 
  // Privilegios (owner / verifier)
  useEffect(() => {
    const checkPrivileges = async () => {
      if (readContract && account) {
        try {
          const ownerAddress = await readContract.owner();
          const verifierAddress = await readContract.verifier();
          setIsPrivileged(
            ownerAddress.toLowerCase() === account.toLowerCase() ||
            verifierAddress.toLowerCase() === account.toLowerCase()
          );
        } catch (err) {
          console.error("Error checking privileges:", err);
        }
      } else {
        setIsPrivileged(false);
      }
    };
    checkPrivileges();
  }, [readContract, account]);
 
  // Carga de stats (globales + usuario)
  useEffect(() => {
    const load = async () => {
      if (!readContract) return;
      try {
        const [sym, dec] = await Promise.all([readContract.symbol(), readContract.decimals()]);
        setSymbol(sym);
        setDecimals(Number(dec));
 
        const stats = await readContract.tokenStats();
        setSupply(ethersNS.formatUnits(stats.supply, dec));
        setBurned(ethersNS.formatUnits(stats.burned, dec));
        setEver(ethersNS.formatUnits(stats.ever, dec));
 
        const isPaused = await readContract.paused();
        setPaused(isPaused);
 
        if (account) {
          const [balWei, burnedUserWei] = await Promise.all([
            readContract.balanceOf(account),
            readContract.burnedOf(account),
          ]);
          setBalance(ethersNS.formatUnits(balWei, dec));
          setUserBurned(ethersNS.formatUnits(burnedUserWei, dec));
        } else {
          setBalance(null);
          setUserBurned(null);
        }
      } catch (e) {
        console.error(e);
        logEthersError(e, { op: "loadStats", account });
      }
    };
    load();
  }, [readContract, account, reloadKey]);
 
  // Add token to MetaMask
  const addTokenToMetaMask = async () => {
    if (!window.ethereum) return toast.error("No wallet detected.");
    await withTx(
      toast,
      async () =>
        window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: CONTRACT_ADDRESS,
              symbol: "CO2X",
              decimals, // reales del contrato
              image: "https://your-domain/logo.png",
            },
          },
        }),
      {
        pending: "Opening wallet…",
        success: "CO₂X added to MetaMask",
        op: "watchAsset",
        context: { address: CONTRACT_ADDRESS, symbol: "CO2X" },
      }
    );
  };
 
  // Chart data
  const sup = Number(supply ?? 0);
  const bur = Number(burned ?? 0);
  const chartData = [
    { name: "Circulating", value: Number.isFinite(sup) ? sup : 0 },
    { name: "Burned", value: Number.isFinite(bur) ? bur : 0 },
  ];
 
  const explorerTxBase =
    chainId === 80002
      ? "https://amoy.polygonscan.com/tx/"
      : "https://polygonscan.com/tx/";
 
  return (
    <div className="admin-chain-dashboard">
      <div className="admin-chain-shell">
        <header className="admin-chain-hero">
          <div>
            <span className="chain-eyebrow">CO₂X · BLOCKCHAIN CONTROL CENTER</span>
            <h1>Tesorería digital</h1>
            <p>Supervisá el suministro y ejecutá operaciones seguras sobre Polygon Amoy.</p>
          </div>
          <div className="admin-chain-wallet">
            <div className={`network-status ${account ? "network-status--online" : ""}`}>
              <span />
              {account ? "Wallet conectada" : "Wallet desconectada"}
            </div>
            <ConnectWalletButton />
          </div>
        </header>

        <div className="chain-environment-note">
          <ShieldCheck size={19} />
          <div><strong>Entorno de demostración</strong><span>Los tokens de esta red no representan créditos de carbono con valor financiero o regulatorio.</span></div>
          <a href={`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">
            Ver contrato <ExternalLink size={14} />
          </a>
        </div>

        {paused && <div className="chain-warning">El contrato está pausado. Las operaciones quedarán bloqueadas.</div>}

        <div className="chain-stats-grid">
          <StatCard icon={<Database />} label="Suministro circulante" value={supply ? `${formatStat(supply)} ${symbol}` : "—"} accent="green" />
          <StatCard icon={<Flame />} label="Tokens retirados" value={burned ? `${formatStat(burned)} ${symbol}` : "—"} accent="orange" />
          <StatCard icon={<Activity />} label="Emisión histórica" value={ever ? `${formatStat(ever)} ${symbol}` : "—"} accent="blue" />
          <StatCard icon={<WalletCards />} label="Saldo de la wallet" value={account && balance ? `${formatStat(balance)} ${symbol}` : "—"} accent="gold" />
        </div>
 
        {account && (
          <div className="chain-quick-actions">
            <div><CircleDollarSign size={18} /><span>Contrato {isPrivileged ? "administrador/verificador" : "conectado"}</span></div>
            <button onClick={addTokenToMetaMask} className="chain-secondary-action">
              Agregar CO₂X a MetaMask
            </button>
          </div>
        )}

        {!account && (
          <section className="wallet-empty-state">
            <WalletCards size={34} />
            <h2>Conectá la wallet administradora</h2>
            <p>La conexión es necesaria para transferir, mintear o retirar tokens.</p>
            <ConnectWalletButton />
          </section>
        )}

        {account && (
          <AdminTransferPanel
            balance={balance}
            symbol={symbol}
            integerOnly={integerOnly}
            onTransferred={() => setReloadKey((key) => key + 1)}
          />
        )}

        {account && isPrivileged && (
          <MintForm
            symbol={symbol}
            decimals={decimals}
            integerOnly={integerOnly}
            explorerTxBase={explorerTxBase}
            onMinted={() => setReloadKey(k => k + 1)}
          />
        )}
 
        {account && <BurnForm />}
 
        <section className="chain-panel supply-panel">
          <div className="chain-panel__header chain-panel__header--compact">
            <div><span className="chain-eyebrow">ANALÍTICA</span><h2>Distribución del suministro</h2></div>
            {account && <span className="personal-burn">Retiraste {formatStat(userBurned || 0)} {symbol}</span>}
          </div>
          <div className="chart-box">
            <ResponsiveContainer>
              <PieChart>
                <Pie dataKey="value" data={chartData} outerRadius={90} label>
                  {/* SVG soporta CSS variables en fill/stroke */}
                  <Cell key="circulating" fill="#2bd48d" />
                  <Cell key="burned" fill="#ff9f65" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
 
        {account && <TransactionHistory />}
      </div>
    </div>
  );
}
 
function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`chain-stat-card chain-stat-card--${accent}`}>
      <div className="chain-stat-card__icon">{icon}</div>
      <div><div className="chain-stat-card__label">{label}</div><div className="chain-stat-card__value">{value}</div></div>
    </div>
  );
}

function formatStat(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("es-UY", { maximumFractionDigits: 3 }) : "0";
}
