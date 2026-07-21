import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, ContactRound, Hash, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import { authFetch } from "../api/authFetch";
import { InlineAlert } from "../ui/Feedback";

const API = import.meta.env.VITE_API_URL;
const INITIAL_FORM = { nombre: "", numeroCorporacion: "", numeroEmpresa: "", direccion: "", directores: "", contacto: "" };

export default function RegistrarEmpresa() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = ({ target }) => setForm((current) => ({ ...current, [target.name]: target.value }));
  const validate = () => {
    const labels = { nombre: "nombre", numeroCorporacion: "número de corporación", numeroEmpresa: "número de empresa", direccion: "dirección", directores: "directores", contacto: "contacto" };
    const missing = Object.keys(labels).find((field) => !form[field].trim());
    return missing ? `El campo ${labels[missing]} es obligatorio.` : "";
  };

  const submit = async (event) => {
    event.preventDefault();
    setError(""); setSuccess("");
    const validationError = validate();
    if (validationError) return setError(validationError);
    setLoading(true);
    try {
      const response = await authFetch(`${API}/empresas`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "No se pudo registrar la empresa");
      setSuccess(`Empresa “${body.nombre || form.nombre}” registrada correctamente.`);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err.message || "No se pudo registrar la empresa");
    } finally { setLoading(false); }
  };

  return (
    <main className="entity-page">
      <header className="entity-hero"><div className="entity-hero__icon"><Building2 size={28} /></div><div><span className="entity-eyebrow">ADMINISTRACIÓN · ORGANIZACIONES</span><h1>Registrar empresa</h1><p>Creá una organización y dejala preparada para asociar plantas y operaciones.</p></div><button type="button" className="entity-secondary" onClick={() => navigate("/empresas")}>Ver empresas</button></header>
      {error && <InlineAlert>{error}</InlineAlert>}
      {success && <InlineAlert type="success">{success}</InlineAlert>}
      <form className="entity-form" onSubmit={submit}>
        <section className="entity-card"><div className="entity-section-title"><span>01</span><div><h2>Identificación legal</h2><p>Datos oficiales de la organización</p></div></div><div className="entity-grid"><CompanyField icon={<Building2 />} label="Nombre de la empresa"><input name="nombre" value={form.nombre} onChange={update} placeholder="Ej. CO₂X Energy" /></CompanyField><CompanyField icon={<Hash />} label="Número de corporación"><input name="numeroCorporacion" value={form.numeroCorporacion} onChange={update} placeholder="Identificador corporativo" /></CompanyField><CompanyField icon={<Hash />} label="Número de empresa"><input name="numeroEmpresa" value={form.numeroEmpresa} onChange={update} placeholder="Identificador interno" /></CompanyField><CompanyField icon={<MapPin />} label="Dirección fiscal"><input name="direccion" value={form.direccion} onChange={update} placeholder="Dirección completa" /></CompanyField></div></section>
        <section className="entity-card"><div className="entity-section-title"><span>02</span><div><h2>Gobierno y contacto</h2><p>Responsables y canal principal de comunicación</p></div></div><div className="entity-grid"><CompanyField icon={<UsersRound />} label="Directores"><input name="directores" value={form.directores} onChange={update} placeholder="Nombres separados por coma" /></CompanyField><CompanyField icon={<ContactRound />} label="Contacto"><input name="contacto" value={form.contacto} onChange={update} placeholder="Email o teléfono principal" /></CompanyField></div></section>
        <footer className="entity-submit"><div><ShieldCheck size={21} /><span><strong>Alta protegida</strong>Solo administradores pueden registrar organizaciones.</span></div><button type="submit" disabled={loading}>{loading ? <><span className="button-spinner" /> Registrando…</> : <><CheckCircle2 size={18} /> Registrar empresa</>}</button></footer>
      </form>
    </main>
  );
}

function CompanyField({ icon, label, children }) { return <label className="entity-field"><span>{icon}{label}</span>{children}</label>; }
