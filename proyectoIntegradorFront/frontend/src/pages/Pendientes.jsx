import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Eye, Filter, RefreshCw } from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiGet } from "../api/apiClient";
import { EmptyState, InlineAlert, LoadingState } from "../ui/Feedback";

export default function Pendientes() {
  const { user, plantas } = useApp();
  const navigate = useNavigate();
  const [plantaSeleccionada, setPlantaSeleccionada] = useState(null);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const API = import.meta.env.VITE_API_URL;
  const userRole = user?.role?.toLowerCase();

  const cargarPendientes = useCallback(async (background = false) => {
    background ? setRefreshing(true) : setLoading(true);
    try {
      const response = await apiGet(`${API}/paquetes/pendientes`);
      const body = await response.json().catch(() => []);
      if (!response.ok) throw new Error(body.message || `No se pudieron cargar los pendientes (${response.status})`);
      setPendientes(body); setError("");
    } catch (err) { setError(err.message || "No se pudieron cargar los pendientes"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [API]);

  useEffect(() => {
    if (!userRole) return;
    if (userRole !== "auditor") { navigate("/dashboard"); return; }
    const initialLoad = setTimeout(() => cargarPendientes(), 0);
    const interval = setInterval(() => cargarPendientes(true), 15000);
    return () => { clearTimeout(initialLoad); clearInterval(interval); };
  }, [cargarPendientes, navigate, userRole]);

  const filtered = useMemo(() => plantaSeleccionada ? pendientes.filter((item) => item.planta?.id === plantaSeleccionada) : pendientes, [pendientes, plantaSeleccionada]);
  if (!user) return <LoadingState title="Preparando auditoría" text="Validando tu sesión y permisos." />;
  if (userRole !== "auditor") return null;

  return (
    <main className="review-page">
      <header className="review-hero"><div className="review-hero__icon"><ClipboardCheck size={27} /></div><div><span className="entity-eyebrow">BANDEJA DE AUDITORÍA</span><h1>Pendientes de auditoría</h1><p>Revisá los paquetes enviados y continuá su circuito de validación.</p></div><span className="review-count"><strong>{pendientes.length}</strong> pendientes</span></header>
      <section className="review-toolbar"><label><Filter size={15} /><span>Filtrar por planta</span><select value={plantaSeleccionada ?? ""} onChange={(event) => setPlantaSeleccionada(event.target.value === "" ? null : Number(event.target.value))}><option value="">Todas las plantas</option>{plantas?.map((planta) => <option key={planta.id} value={planta.id}>{planta.nombre}</option>)}</select></label><button onClick={() => cargarPendientes(true)} disabled={refreshing}>{refreshing ? <span className="button-spinner" /> : <RefreshCw size={15} />} Actualizar</button></section>
      {error && <InlineAlert>{error}</InlineAlert>}
      {loading ? <LoadingState title="Buscando paquetes pendientes" text="Consultando la bandeja de auditoría…" /> : filtered.length === 0 ? <EmptyState title={pendientes.length ? "Sin resultados para esta planta" : "La bandeja está al día"} text={pendientes.length ? "Probá seleccionando otra planta." : "No hay paquetes esperando revisión."} /> : <section className="review-table-card"><div className="table-scroll"><table className="review-table"><thead><tr><th>Paquete</th><th>Planta</th><th>Captura</th><th>Volumen</th><th>Estado</th><th /></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>#{item.id}</strong></td><td>{item.planta?.nombre || "Sin planta"}</td><td>{formatDate(item.captureDate)}</td><td><strong>{Number(item.tonCO2eq || 0).toLocaleString("es-UY", { maximumFractionDigits: 3 })}</strong> tCO₂e</td><td><span className="review-status">Pendiente</span>{item.numeroRevision > 1 && <span className="review-revision">Rev. {item.numeroRevision}</span>}</td><td><button className="review-action" onClick={() => navigate(`/auditar/${item.id}`)}>Revisar <Eye size={15} /></button></td></tr>)}</tbody></table></div></section>}
    </main>
  );
}

function formatDate(value) { if (!value) return "—"; return new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
