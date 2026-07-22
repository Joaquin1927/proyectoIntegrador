import { useEffect, useState } from "react";
import { Box, CheckCircle2, Copy, ExternalLink, FileJson, RefreshCw } from "lucide-react";
import { authFetch } from "../api/authFetch";

const API = import.meta.env.VITE_API_URL;
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export default function MintedPackagesPanel({ reloadKey = 0 }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [copiedCid, setCopiedCid] = useState("");

  useEffect(() => {
    let cancelled = false;

    authFetch(`${API}/paquetes/minteados`)
      .then(async (response) => {
        if (response.ok) return response.json();
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "No se pudieron cargar los paquetes minteados");
      })
      .then((data) => { if (!cancelled) setPackages(Array.isArray(data) ? data : []); })
      .catch((requestError) => { if (!cancelled) setError(requestError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [reloadKey, refreshKey]);

  const copyCid = async (cid) => {
    await navigator.clipboard.writeText(cid);
    setCopiedCid(cid);
    window.setTimeout(() => setCopiedCid(""), 1800);
  };

  return (
    <section className="chain-panel minted-panel">
      <div className="chain-panel__header">
        <div className="chain-panel__icon chain-panel__icon--green"><Box size={20} /></div>
        <div><span className="chain-eyebrow">TRAZABILIDAD</span><h2>Paquetes minteados</h2><p>Certificados publicados en Polygon Amoy con su metadata respaldada en IPFS.</p></div>
        <button className="minted-refresh" onClick={() => { setLoading(true); setError(""); setRefreshKey((key) => key + 1); }} disabled={loading}><RefreshCw size={15} className={loading ? "is-spinning" : ""} /> Actualizar</button>
      </div>

      {loading && <div className="minted-state"><span className="minted-spinner" /><strong>Cargando certificados minteados…</strong></div>}
      {!loading && error && <div className="minted-state minted-state--error"><strong>{error}</strong><span>Reintentá en unos segundos.</span></div>}
      {!loading && !error && packages.length === 0 && <div className="minted-state"><Box size={28} /><strong>Todavía no hay paquetes minteados</strong><span>Cuando se confirme el primer mint aparecerá acá.</span></div>}

      {!loading && !error && packages.length > 0 && <div className="minted-grid">
        {packages.map((item) => {
          const isExpanded = expanded === item.paqueteId;
          return <article className="minted-card" key={item.paqueteId}>
            <div className="minted-card__top"><div className="minted-card__status"><CheckCircle2 size={15} /> Minteado</div><span>Paquete #{item.paqueteId}</span></div>
            <h3>{item.certId || `Certificado #${item.paqueteId}`}</h3>
            <div className="minted-card__facts">
              <div><span>CO₂ certificado</span><strong>{formatTons(item.tonCO2eq)}</strong></div>
              <div><span>Planta</span><strong>{item.planta || "Sin especificar"}</strong></div>
              <div><span>Captura</span><strong>{formatDate(item.captureDate)}</strong></div>
            </div>
            <div className="cid-box"><span>CID de IPFS</span><div><code title={item.ipfsCid}>{shortHash(item.ipfsCid, 13, 9)}</code><button onClick={() => copyCid(item.ipfsCid)} title="Copiar CID"><Copy size={14} /></button></div>{copiedCid === item.ipfsCid && <small>CID copiado</small>}</div>
            <div className="minted-card__actions">
              <a href={`${IPFS_GATEWAY}${item.ipfsCid}`} target="_blank" rel="noreferrer"><FileJson size={15} /> Ver en IPFS <ExternalLink size={12} /></a>
              {item.blockchainTxHash && <a href={`https://amoy.polygonscan.com/tx/${item.blockchainTxHash}`} target="_blank" rel="noreferrer">PolygonScan <ExternalLink size={12} /></a>}
              <button onClick={() => setExpanded(isExpanded ? null : item.paqueteId)}>{isExpanded ? "Ocultar metadata" : "Ver metadata"}</button>
            </div>
            {isExpanded && <pre className="metadata-preview">{JSON.stringify(parseMetadata(item.metadata), null, 2)}</pre>}
          </article>;
        })}
      </div>}
    </section>
  );
}

function parseMetadata(value) {
  if (!value) return {};
  try { return typeof value === "string" ? JSON.parse(value) : value; } catch { return { contenido: value }; }
}

function formatTons(value) {
  return value == null ? "—" : `${Number(value).toLocaleString("es-UY", { maximumFractionDigits: 3 })} tCO₂e`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-UY", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function shortHash(value, start, end) {
  return value && value.length > start + end ? `${value.slice(0, start)}…${value.slice(-end)}` : value;
}
