import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { authFetch } from "../api/authFetch";

const MINT_STEPS = [
  { title: "Validando paquete", detail: "Comprobando permisos y estado" },
  { title: "Preparando certificado", detail: "Verificando metadata y CID de IPFS" },
  { title: "Enviando a Polygon", detail: "Esperando la respuesta de blockchain" },
  { title: "Transacción enviada", detail: "Hash recibido y registrado correctamente" },
];

let approvedRequest = null;

function fetchApprovedOnce(api) {
  if (!approvedRequest) {
    approvedRequest = authFetch(`${api}/paquetes/aprobados`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudieron cargar los paquetes aprobados");
        return res.json();
      })
      .finally(() => { approvedRequest = null; });
  }

  return approvedRequest;
}

export default function Aprobados() {
  const { user } = useApp();
  const navigate = useNavigate();
  const progressTimer = useRef(null);

  const [aprobados, setAprobados] = useState([]);
  const [loadingAprobados, setLoadingAprobados] = useState(true);
  const [mintingId, setMintingId] = useState(null);
  const [mintStep, setMintStep] = useState(0);
  const [mintResult, setMintResult] = useState(null);
  const [mintError, setMintError] = useState("");

  const API = import.meta.env.VITE_API_URL;
  const userEmail = user?.email;
  const userRole = user?.role?.toLowerCase();

  useEffect(() => {
    if (!userEmail || !userRole) return;

    if (userRole !== "admin") {
      console.warn("Acceso exclusivo para administradores");
      navigate("/dashboard");
      return;
    }

    let cancelled = false;

    fetchApprovedOnce(API)
      .then((data) => {
        if (!cancelled) setAprobados(data);
      })
      .catch((err) => console.error("Error cargando aprobados:", err))
      .finally(() => {
        if (!cancelled) setLoadingAprobados(false);
      });

    return () => { cancelled = true; };
  }, [API, navigate, userEmail, userRole]);

  useEffect(() => () => clearInterval(progressTimer.current), []);

  const mintear = async (id) => {
    setMintingId(id);
    setMintStep(0);
    setMintResult(null);
    setMintError("");

    progressTimer.current = setInterval(() => {
      setMintStep((current) => Math.min(current + 1, 2));
    }, 1400);

    try {
      const token = localStorage.getItem("token");
      const res = await authFetch(`${API}/paquetes/${id}/mint`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const responseBody = await res.text();
      if (!res.ok) {
        let errorMessage = responseBody || "Error al mintear";
        try {
          const errorBody = JSON.parse(responseBody);
          errorMessage = errorBody.message || errorMessage;
        } catch {
          // El backend anterior podía responder texto plano.
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = JSON.parse(responseBody);
      } catch {
        // Compatibilidad temporal si quedó ejecutándose una versión anterior
        // del backend que todavía responde texto plano.
        result = {
          paqueteId: id,
          estado: "MINTEADO",
          ipfsCid: null,
          transactionHash: null,
          legacyResponse: true,
        };
      }
      clearInterval(progressTimer.current);
      setMintStep(3);
      setMintResult(result);
      setAprobados((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      clearInterval(progressTimer.current);
      console.error(err);
      setMintError(err.message || "No se pudo completar el mint");
    }
  };

  const cerrarProceso = () => {
    if (mintingId && !mintResult && !mintError) return;
    setMintingId(null);
    setMintResult(null);
    setMintError("");
  };

  if (!user) return <LoadingState text="Preparando tu sesión..." />;
  if (userRole !== "admin") return null;

  return (
    <section className="panel">
      <div className="approved-heading">
        <div>
          <h1>Paquetes aprobados</h1>
          <p className="muted">Certificados listos para emitir en Polygon Amoy.</p>
        </div>
        {!loadingAprobados && <span className="approved-count">{aprobados.length} listos</span>}
      </div>

      {loadingAprobados ? (
        <LoadingState text="Buscando paquetes listos para mintear..." />
      ) : aprobados.length === 0 ? (
        <div className="approved-empty">
          <span className="approved-empty-icon">✓</span>
          <p>No hay paquetes pendientes de mint.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>Planta</th><th>Ton CO₂</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {aprobados.map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{p.planta?.nombre || "—"}</td>
                  <td>{Number(p.tonCO2eq || 0).toFixed(3)}</td>
                  <td><span className="status-ready">Listo</span></td>
                  <td>
                    <button className="primary" disabled={mintingId !== null} onClick={() => mintear(p.id)}>
                      {mintingId === p.id ? <><span className="button-spinner" /> Minteando</> : "Mintear"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mintingId !== null && (
        <MintProgress
          paqueteId={mintingId}
          step={mintStep}
          result={mintResult}
          error={mintError}
          onClose={cerrarProceso}
        />
      )}
    </section>
  );
}

function LoadingState({ text }) {
  return <div className="approved-loading"><span className="chain-spinner" /><p>{text}</p></div>;
}

function MintProgress({ paqueteId, step, result, error, onClose }) {
  return (
    <div className="mint-overlay" role="dialog" aria-modal="true" aria-label="Progreso del mint">
      <div className="mint-card">
        <div className="mint-card-header">
          <div><span className="mint-eyebrow">PAQUETE #{paqueteId}</span><h2>{error ? "No se pudo completar" : result ? "¡Mint enviado!" : "Registrando en blockchain"}</h2></div>
          {(result || error) && <button className="mint-close" onClick={onClose} aria-label="Cerrar">×</button>}
        </div>

        <div className="mint-chain">
          {MINT_STEPS.map((item, index) => {
            const state = error && index === step ? "error" : index < step || result ? "done" : index === step ? "active" : "pending";
            return (
              <div className={`mint-chain-step ${state}`} key={item.title}>
                <div className="mint-node">{state === "done" ? "✓" : state === "error" ? "!" : index + 1}</div>
                <div><strong>{item.title}</strong><span>{item.detail}</span></div>
              </div>
            );
          })}
        </div>

        {result && (
          <div className="mint-receipt">
            {result.ipfsCid && <div><span>CID de IPFS</span><code>{result.ipfsCid}</code></div>}
            {result.transactionHash && <div><span>Hash de transacción</span><code>{result.transactionHash}</code></div>}
            {result.transactionHash ? (
              <a href={`https://amoy.polygonscan.com/tx/${result.transactionHash}`} target="_blank" rel="noreferrer">Ver transacción en PolygonScan ↗</a>
            ) : (
              <p className="legacy-response">El mint terminó correctamente. Reinicia el backend para que las próximas operaciones también muestren CID y hash.</p>
            )}
          </div>
        )}

        {error && <div className="mint-error">{error}</div>}
        {!result && !error && <p className="mint-wait">No cierres esta ventana mientras se confirma la operación.</p>}
      </div>
    </div>
  );
}
