// src/components/web3dashboard/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import * as ethersNS from "ethers";
import { useCO2X } from "../web3/useCO2X";
import { CONTRACT_ADDRESS, ABI } from "../web3/contractConfig";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import TransactionHistory from "./TransactionHistory";
import BurnForm from "./BurnForm";
import mintForm from "./mintForm";
import { useToast } from "../ui/Toaster";
import { withTx } from "../utils/tx";
import { toastMessageFromError, logEthersError } from "../utils/errors";
import { readProvider } from "../utils/provider";
import ConnectWalletButton from '../components/ConnectWalletButton';
import '../styles/dashboard.css';
 
export default function Dashboard() {
  const { account, chainId, transfer, simulateTransfer } = useCO2X();
 
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
 
  // Transfer
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const onTransfer = async () => {
    if (!account) return toast.error("Connect your wallet.");
    if (!to || !amount) return toast.error("Enter recipient and amount.");
    if (integerOnly && String(amount).includes(".")) {
      return toast.error("This token only accepts integer amounts (1, 2, 3…).");
    }
    try {
      await simulateTransfer(to, amount);
      await withTx(
        toast,
        () => transfer(to, amount),
        { pending: "Sending…", success: "Transfer confirmed ✅", op: "transfer", context: { to, amount } }
      );
      setAmount(""); setTo("");
    } catch (e) {
      logEthersError(e, { op: "transfer.catch", to, amount });
      toast.error(toastMessageFromError(e));
    }
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
    <div className="dashboard section section--light">
      <div className="container">
        <div className="dashboard-header">
        <h1 className="dashboard-title">CO₂X Dashboard</h1>
        <div className="dashboard-wallet">
          <ConnectWalletButton />
        </div>
      </div>
 
        {/* Disclaimer */}
        <div className="dashboard-disclaimer alert alert--info">
          ⚠️ Test Environment<br />
          The tokens and values shown here are for testing and demonstration only.<br />
          They do not represent carbon credits, removals, or offsets, and have no environmental, financial, or compliance value.
        </div>
 
        {/* Connection badge */}
        <div className="dashboard-connection">
          {!!account ? (
            <span className="badge badge--ok">Wallet connected</span>
          ) : (
            <span className="badge badge--warn">🔌 Connect wallet to interact</span>
          )}
        </div>
 
        {paused && <div className="alert alert--warn">Contract paused.</div>}
 
        {/* Add to MetaMask */}
        {account && (
          <div className="dashboard-actions">
            <button onClick={addTokenToMetaMask} className="btn btn--gold">
              Add CO2X to MetaMask
            </button>
          </div>
        )}
 
        {/* Mint (owner / verifier) */}
        {account && isPrivileged && (
          <MintForm
            symbol={symbol}
            decimals={decimals}
            integerOnly={integerOnly}
            explorerTxBase={explorerTxBase}
            onMinted={() => setReloadKey(k => k + 1)}
          />
        )}
 
        {/* Transfer */}
        {account && (
          <div className="panel">
            <h3 className="panel-title">Transfer</h3>
            <div className="form-grid">
              <input
                className="input"
                placeholder="Recipient 0x…"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
              <input
                className="input"
                placeholder={integerOnly ? `Integer amount (${symbol || "CO2X"})` : `Amount (${symbol || "CO2X"})`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                inputMode={integerOnly ? "numeric" : "decimal"}
                step={integerOnly ? "1" : "any"}
              />
              <button onClick={onTransfer} className="btn btn--gold">Send</button>
            </div>
            <small className="muted">
              {integerOnly
                ? "This token only accepts integer amounts."
                : `Decimals allowed (decimals = ${decimals}).`}
            </small>
          </div>
        )}
 
        {/* Burn */}
        {account && <BurnForm />}
 
        {/* Stats */}
        <div className="grid-cards">
          <StatCard label="Total Supply" value={supply ? `${supply} ${symbol}` : "..."} />
          <StatCard label="Total Burned" value={burned ? `${burned} ${symbol}` : "..."} />
          <StatCard label="Ever Minted" value={ever ? `${ever} ${symbol}` : "..."} />
          {account && <StatCard label="Your Balance" value={balance ? `${balance} ${symbol}` : "..."} />}
          {account && <StatCard label="You Burned" value={userBurned ? `${userBurned} ${symbol}` : "0"} />}
        </div>
 
        {/* Chart */}
        <div className="panel">
          <h3 className="panel-title">Supply Breakdown</h3>
          <div className="chart-box">
            <ResponsiveContainer>
              <PieChart>
                <Pie dataKey="value" data={chartData} outerRadius={90} label>
                  {/* SVG soporta CSS variables en fill/stroke */}
                  <Cell key="circulating" fill="var(--olive)" />
                  <Cell key="burned" fill="#9aa0a6" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
 
        {/* History */}
        {account && <TransactionHistory />}
      </div>
    </div>
  );
}
 
function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
 
 

 
 

 
 

 

 


 