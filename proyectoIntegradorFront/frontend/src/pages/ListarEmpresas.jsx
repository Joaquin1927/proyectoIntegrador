import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Plus, Search, UsersRound } from "lucide-react";
import { authFetch } from "../api/authFetch";
import { EmptyState, InlineAlert, LoadingState } from "../ui/Feedback";
import PlantasPorEmpresa from "../components/PlantasPorEmpresa.jsx";

const API = import.meta.env.VITE_API_URL;

export default function ListarEmpresas() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    authFetch(`${API}/empresas`).then(async (response) => {
      const body = await response.json().catch(() => []);
      if (!response.ok) throw new Error(body.message || "No se pudieron obtener las empresas");
      if (active) setEmpresas(body);
    }).catch((err) => active && setError(err.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? empresas.filter((item) => [item.nombre, item.numeroCorporacion, item.numeroEmpresa, item.direccion].some((value) => String(value || "").toLowerCase().includes(normalized))) : empresas;
  }, [empresas, query]);

  return (
    <main className="entity-page">
      <header className="entity-hero"><div className="entity-hero__icon"><Building2 size={28} /></div><div><span className="entity-eyebrow">ADMINISTRACIÓN · ORGANIZACIONES</span><h1>Empresas registradas</h1><p>Consultá las organizaciones habilitadas, sus plantas y datos corporativos.</p></div><button className="entity-primary" onClick={() => navigate("/empresa/registrar")}><Plus size={17} /> Nueva empresa</button></header>
      <div className="entity-list-toolbar"><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, número o dirección…" /></label><span>{filtered.length} de {empresas.length}</span></div>
      {error && <InlineAlert>{error}</InlineAlert>}
      {loading ? <LoadingState title="Cargando empresas" text="Consultando el registro de organizaciones…" /> : filtered.length === 0 ? <EmptyState title={empresas.length ? "No encontramos coincidencias" : "Todavía no hay empresas"} text={empresas.length ? "Probá con otro término de búsqueda." : "Registrá la primera organización para comenzar."} action={!empresas.length && <button className="entity-primary" onClick={() => navigate("/empresa/registrar")}><Plus size={16} /> Registrar empresa</button>} /> : <section className="company-grid">{filtered.map((company) => <article className="company-card" key={company.id}><header><span><Building2 size={19} /></span><div><h2>{company.nombre}</h2><small>Empresa #{company.id}</small></div></header><dl><div><dt>Corporación</dt><dd>{company.numeroCorporacion || "—"}</dd></div><div><dt>Número de empresa</dt><dd>{company.numeroEmpresa || "—"}</dd></div></dl><p><MapPin size={14} /> {company.direccion || "Dirección no informada"}</p><div className="company-plants"><span>Plantas asociadas</span><PlantasPorEmpresa empresaId={company.id} /></div><footer><UsersRound size={14} /><span>{company.directores || "Directores no informados"}</span><strong>{company.contacto || "Sin contacto"}</strong></footer></article>)}</section>}
    </main>
  );
}
