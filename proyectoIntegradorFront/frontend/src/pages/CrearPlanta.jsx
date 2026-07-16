import { useEffect, useState } from "react";
import { Building2, CheckCircle2, FileJson, FileText, MapPin, Plus, Trash2, Upload, UserRound } from "lucide-react";
import { authFetch } from "../api/authFetch";

const API = import.meta.env.VITE_API_URL;
const INITIAL_FORM = { nombre: "", empresaId: "", direccion: "", managerEmail: "", metadata: "{}", pozos: [{ nombre: "" }] };

export default function CrearPlanta() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [empresas, setEmpresas] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [jsonFileName, setJsonFileName] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const cargarEmpresas = async () => {
      try {
        const response = await authFetch(`${API}/empresas`);
        if (!response.ok) throw new Error("No se pudieron cargar las empresas");
        setEmpresas(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingCompanies(false);
      }
    };
    cargarEmpresas();
  }, []);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const addPozo = () => setForm((current) => ({ ...current, pozos: [...current.pozos, { nombre: "" }] }));
  const updatePozo = (index, value) => setForm((current) => ({ ...current, pozos: current.pozos.map((pozo, i) => i === index ? { ...pozo, nombre: value } : pozo) }));
  const removePozo = (index) => setForm((current) => ({ ...current, pozos: current.pozos.filter((_, i) => i !== index) }));

  const handleJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      try {
        const json = JSON.parse(target.result);
        const { nombre, empresa, empresaId, direccion, managerEmail, pozos, ...metadata } = json;
        const matchedCompany = empresas.find((item) => item.nombre?.toLowerCase() === empresa?.toLowerCase());
        setForm({
          nombre: nombre || "",
          empresaId: empresaId || matchedCompany?.id || "",
          direccion: direccion || "",
          managerEmail: managerEmail || "",
          metadata: JSON.stringify(metadata, null, 2),
          pozos: pozos?.length ? pozos : [{ nombre: "" }],
        });
        setJsonFileName(file.name);
        setError("");
      } catch {
        setError("El archivo seleccionado no contiene un JSON válido");
      }
    };
    reader.readAsText(file);
  };

  const validate = () => {
    if (!form.nombre.trim()) return "El nombre de la planta es obligatorio";
    if (!form.empresaId) return "Seleccioná la empresa responsable";
    if (!form.direccion.trim()) return "La dirección es obligatoria";
    if (!/^\S+@\S+\.\S+$/.test(form.managerEmail)) return "Ingresá un email de manager válido";
    if (!form.pozos.length || form.pozos.some((pozo) => !pozo.nombre.trim())) return "Todos los pozos deben tener nombre";
    if (!pdf) return "Adjuntá el PDF técnico obligatorio";
    try { JSON.parse(form.metadata); } catch { return "La metadata debe ser JSON válido"; }
    return null;
  };

  const submit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      const payload = { ...form, empresa: { id: Number(form.empresaId) }, empresaId: undefined };
      const data = new FormData();
      data.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      data.append("pdf", pdf);
      const response = await authFetch(`${API}/plantas`, { method: "POST", body: data });
      const body = await response.text();
      if (!response.ok) {
        let message = "No se pudo registrar la planta";
        try { message = JSON.parse(body).message || message; } catch { /* respuesta sin JSON */ }
        throw new Error(message);
      }
      setSuccess(true);
      setForm(INITIAL_FORM);
      setPdf(null);
      setJsonFileName("");
    } catch (err) {
      setError(err.message || "No se pudo registrar la planta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="facility-page">
      <header className="facility-hero">
        <div className="facility-hero__icon"><Building2 size={28} /></div>
        <div><span className="facility-eyebrow">GESTIÓN OPERATIVA</span><h1>Registrar planta</h1><p>Centralizá la información de la instalación, sus pozos y la documentación técnica.</p></div>
        <div className="facility-progress"><span>ALTA DE INSTALACIÓN</span><strong>Datos + evidencia</strong></div>
      </header>

      {error && <div className="facility-alert facility-alert--error">{error}</div>}
      {success && <div className="facility-alert facility-alert--success"><CheckCircle2 size={19} /> Planta registrada correctamente.</div>}

      <form className="facility-form" onSubmit={submit}>
        <section className="facility-card">
          <SectionTitle number="01" title="Información general" subtitle="Identificación y responsable de la instalación" />
          <div className="facility-grid">
            <Field icon={<Building2 />} label="Nombre de la planta"><input value={form.nombre} onChange={(event) => updateField("nombre", event.target.value)} placeholder="Ej. Planta Norte" /></Field>
            <Field icon={<Building2 />} label="Empresa"><select value={form.empresaId} onChange={(event) => updateField("empresaId", event.target.value)} disabled={loadingCompanies}><option value="">{loadingCompanies ? "Cargando empresas…" : "Seleccionar empresa"}</option>{empresas.map((empresa) => <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>)}</select></Field>
            <Field icon={<MapPin />} label="Dirección"><input value={form.direccion} onChange={(event) => updateField("direccion", event.target.value)} placeholder="Dirección de la instalación" /></Field>
            <Field icon={<UserRound />} label="Email del manager"><input type="email" value={form.managerEmail} onChange={(event) => updateField("managerEmail", event.target.value)} placeholder="manager@empresa.com" /></Field>
          </div>
        </section>

        <section className="facility-card">
          <SectionTitle number="02" title="Pozos asociados" subtitle={`${form.pozos.length} ${form.pozos.length === 1 ? "pozo configurado" : "pozos configurados"}`} />
          <div className="facility-wells">{form.pozos.map((pozo, index) => <div className="facility-well" key={index}><span>{String(index + 1).padStart(2, "0")}</span><input value={pozo.nombre} onChange={(event) => updatePozo(index, event.target.value)} placeholder={`Nombre del pozo ${index + 1}`} />{form.pozos.length > 1 && <button type="button" onClick={() => removePozo(index)} aria-label={`Quitar pozo ${index + 1}`}><Trash2 size={17} /></button>}</div>)}</div>
          <button className="facility-add" type="button" onClick={addPozo}><Plus size={17} /> Agregar otro pozo</button>
        </section>

        <section className="facility-card">
          <SectionTitle number="03" title="Evidencia técnica" subtitle="Documentación necesaria para validar la instalación" />
          <div className="facility-uploads">
            <UploadBox icon={<FileJson />} label="Datos de planta (opcional)" hint="Importá y completá el formulario desde un archivo .json" fileName={jsonFileName}><input type="file" accept=".json,application/json" onChange={handleJson} /></UploadBox>
            <UploadBox icon={<FileText />} label="PDF técnico" hint="Documento técnico obligatorio en formato PDF" fileName={pdf?.name}><input type="file" accept="application/pdf" onChange={(event) => setPdf(event.target.files?.[0] || null)} /></UploadBox>
          </div>
          <label className="facility-metadata"><span>Metadata JSON</span><textarea value={form.metadata} onChange={(event) => updateField("metadata", event.target.value)} spellCheck="false" /></label>
        </section>

        <footer className="facility-submit"><div><ShieldCheckIcon /><span><strong>Registro protegido</strong>La información quedará asociada a la empresa seleccionada.</span></div><button type="submit" disabled={submitting}>{submitting ? <><span className="button-spinner" /> Registrando…</> : <><CheckCircle2 size={18} /> Registrar planta</>}</button></footer>
      </form>
    </main>
  );
}

function SectionTitle({ number, title, subtitle }) { return <div className="facility-section-title"><span>{number}</span><div><h2>{title}</h2><p>{subtitle}</p></div></div>; }
function Field({ icon, label, children }) { return <label className="facility-field"><span>{icon}{label}</span>{children}</label>; }
function UploadBox({ icon, label, hint, fileName, children }) { return <label className={`facility-upload ${fileName ? "facility-upload--ready" : ""}`}><span className="facility-upload__icon">{fileName ? <CheckCircle2 /> : icon}</span><strong>{fileName || label}</strong><small>{fileName ? "Archivo listo para enviar" : hint}</small><span className="facility-upload__action"><Upload size={14} /> Seleccionar archivo</span>{children}</label>; }
function ShieldCheckIcon() { return <CheckCircle2 size={22} />; }
