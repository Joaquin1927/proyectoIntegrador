import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { authFetch } from "../api/authFetch";

const ESTADOS = [
  "PENDIENTE", "EN_REVISION", "EN_REVISION_CORREGIDO",
  "APROBADO", "RECHAZADO", "MINTEADO",
];

const initialFilters = {
  id: "", fechaDesde: "", fechaHasta: "", plantaId: "",
  estado: "", tipoProyecto: "",
};

export default function Historial() {
  const { user, plantas } = useApp();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [historial, setHistorial] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function buscar(activeFilters = filters) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== "") params.set(key, value);
      });

      const res = await authFetch(`${API}/paquetes/buscar?${params}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "No se pudo buscar paquetes");
      setHistorial(body);
    } catch (err) {
      setError(err.message || "No se pudo buscar paquetes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    authFetch(`${API}/paquetes/buscar`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "No se pudo cargar el historial");
        return body;
      })
      .then((body) => { if (!cancelled) setHistorial(body); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [API, user]);

  const limpiar = () => {
    setFilters(initialFilters);
    buscar(initialFilters);
  };

  const exportarCSV = () => {
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = historial.map((p) => [
      p.id, p.certId, p.planta?.nombre, p.captureDate,
      p.tonCO2eq, p.estado, p.createdBy, p.auditor,
    ].map(escape).join(","));
    const csv = [
      "ID,Certificado,Planta,Fecha,TonCO2eq,Estado,CreadoPor,Auditor",
      ...rows,
    ].join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `paquetes-co2x-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <section className="panel">
      <div className="approved-heading">
        <div>
          <h1>Consulta de paquetes</h1>
          <p className="muted">Busca por identificador, período, planta, estado o proyecto.</p>
        </div>
        <button disabled={!historial.length} onClick={exportarCSV}>Exportar CSV</button>
      </div>

      <form className="package-filters" onSubmit={(event) => { event.preventDefault(); buscar(); }}>
        <label>ID<input type="number" min="1" value={filters.id} onChange={(e) => setFilters({ ...filters, id: e.target.value })} /></label>
        <label>Desde<input type="date" value={filters.fechaDesde} onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })} /></label>
        <label>Hasta<input type="date" value={filters.fechaHasta} onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })} /></label>
        <label>Planta<select value={filters.plantaId} onChange={(e) => setFilters({ ...filters, plantaId: e.target.value })}><option value="">Todas</option>{plantas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
        <label>Estado<select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}><option value="">Todos</option>{ESTADOS.map((estado) => <option key={estado}>{estado}</option>)}</select></label>
        <label>Tipo de proyecto<input value={filters.tipoProyecto} onChange={(e) => setFilters({ ...filters, tipoProyecto: e.target.value })} placeholder="Ej. CCS" /></label>
        <div className="filter-actions"><button className="primary" type="submit">Buscar</button><button type="button" onClick={limpiar}>Limpiar</button></div>
      </form>

      {error && <div className="mint-error">{error}</div>}
      {loading ? <div className="approved-loading"><span className="chain-spinner" /><p>Consultando paquetes...</p></div> : historial.length === 0 ? <p className="muted">No se encontraron paquetes.</p> : (
        <div className="table-scroll"><table className="table"><thead><tr><th>ID</th><th>Certificado</th><th>Planta</th><th>Fecha</th><th>Volumen</th><th>Estado</th><th></th></tr></thead><tbody>{historial.map((p) => <tr key={p.id}><td>#{p.id}</td><td>{p.certId || "—"}</td><td>{p.planta?.nombre || "—"}</td><td>{p.captureDate}</td><td>{Number(p.tonCO2eq || 0).toFixed(3)}</td><td>{p.estado}</td><td><button onClick={() => navigate(`/paquete/${p.id}`)}>Ver detalle</button></td></tr>)}</tbody></table></div>
      )}
    </section>
  );
}
