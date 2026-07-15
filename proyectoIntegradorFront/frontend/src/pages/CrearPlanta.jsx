import { useState, useEffect } from "react";
import axios from "../api/axios";
import { authFetch } from "../api/authFetch";
import { useMsal } from "@azure/msal-react";

export default function CrearPlanta() {
  const API = import.meta.env.VITE_API_URL;
  const { instance, accounts } = useMsal();

useEffect(() => {
const cargarEmpresas = async () => {
try {
const response = await instance.acquireTokenSilent({
scopes: [
"api://36920833-e50a-48be-b51a-e363b373c011/access_as_user",
],
account: accounts[0],
});
 
const token = response.accessToken;
 
const res = await axios.get(
`${API}/empresas`,
{
headers: {
Authorization: `Bearer ${token}`,
},
}
);
 
console.log("EMPRESAS:", res.data);
 
setEmpresas(res.data);
 
} catch (err) {
console.error("Error cargando empresas", err);
}
};
 
cargarEmpresas();
 
}, [instance, accounts, API]);
  const [form, setForm] = useState({
    nombre: "",
    empresaId: "",
    direccion: "",
    managerEmail: "",
    metadata: "{}",
    pozos: [{ nombre: "" }],
  });
  const [empresas, setEmpresas] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const addPozo = () => {
    setForm({ ...form, pozos: [...form.pozos, { nombre: "" }] });
  };

  const updatePozo = (index, value) => {
    const updated = [...form.pozos];
    updated[index].nombre = value;
    setForm({ ...form, pozos: updated });
  };

  const removePozo = (index) => {
    const updated = [...form.pozos];
    updated.splice(index, 1);
    setForm({ ...form, pozos: updated });
  };
  const handleJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = JSON.parse(event.target.result);
      const {
        nombre,
        empresa,
        empresaId: jsonEmpresaId,
        direccion,
        managerEmail,
        pozos,
        ...metadata
      } = json;
      let empresaId = "";
      if (jsonEmpresaId) {
        empresaId = jsonEmpresaId;
      } else if (empresa) {
        const encontrada = empresas.find(
          (emp) => emp.nombre.toLowerCase() === empresa.toLowerCase(),
        );
        if (encontrada) {
          empresaId = encontrada.id;
        }
      }
      setForm({
        nombre: nombre || "",
        empresaId,
        direccion: direccion || "",
        managerEmail: managerEmail || "",
        metadata: JSON.stringify(metadata, null, 2),
        pozos: pozos?.length ? pozos : [{ nombre: "" }],
      });
      setError("");
    };
    reader.readAsText(file);
  };
  const validar = () => {
    if (!form.nombre.trim()) return "El nombre de la planta es obligatorio";
    if (!form.empresaId) return "Debe seleccionar una empresa";
    if (!form.direccion.trim()) return "La dirección es obligatoria";
    if (!form.managerEmail.trim()) return "El email del manager es obligatorio";

    if (!form.pozos.length) return "Debe agregar al menos un pozo";
    if (form.pozos.some((p) => !p.nombre.trim()))
      return "Todos los pozos deben tener nombre";

    if (!pdf) return "Debe subir el PDF técnico";

    try {
      JSON.parse(form.metadata);
    } catch {
      return "El campo metadata debe ser JSON válido";
    }

    return null;
  };

  const submit = async () => {
    const err = validar();
    if (err) {
      setError(err);
      return;
    }
    try {
      console.log("FORM:", form);
      const payload = {
        nombre: form.nombre,
        empresa: {
          id: parseInt(form.empresaId),
        },
        direccion: form.direccion,
        managerEmail: form.managerEmail,
        metadata: form.metadata,
        pozos: form.pozos,
      };
      console.log("PAYLOAD:", payload);
      const fd = new FormData();
      fd.append(
        "data",
        new Blob([JSON.stringify(payload)], {
          type: "application/json",
        }),
      );
      fd.append("pdf", pdf);
      const res = await authFetch(`${API}/plantas`, {
        method: "POST",
        body: fd,
      });

      console.log("STATUS:", res.status);

      const text = await res.text();
      console.log("STATUS:", res.status);
      console.log("RESPONSE:", text);
      if (!res.ok) {
        let message = "Error al registrar la planta";
        try {
          message = JSON.parse(text).message;
        } catch {}
        throw new Error(message);
      }
      alert("Planta registrada correctamente");
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al registrar la planta");
    }
  };

  return (
    <section className="content">
      <h1>🏭 Registrar Planta</h1>
      <p className="muted">Alta de plantas con pozos, metadata y PDF técnico</p>

      {error && (
        <div
          className="panel"
          style={{
            borderColor: "var(--danger)",
            color: "var(--danger)",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <div className="panel">
        <div className="grid two">
          <div className="field">
            <label>Nombre de la planta</label>
            <input
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Empresa</label>
            <select
              value={form.empresaId || ""}
              onChange={(e) => updateField("empresaId", e.target.value)}
            >
              <option value="" disabled>
                Seleccionar empresa
              </option>
               
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Dirección</label>
            <input
              value={form.direccion}
              onChange={(e) => updateField("direccion", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Email del manager</label>
            <input
              value={form.managerEmail}
              onChange={(e) => updateField("managerEmail", e.target.value)}
            />
          </div>
        </div>
        <h3>Pozos</h3>
        {form.pozos.map((pozo, i) => (
          <div className="field" key={i}>
            <label>Pozo {i + 1}</label>

            <div
              className="actions"
              style={{ justifyContent: "space-between" }}
            >
              <input
                placeholder={`Nombre del pozo ${i + 1}`}
                value={pozo.nombre}
                onChange={(e) => updatePozo(i, e.target.value)}
                style={{ flex: 1 }}
              />

              {/* Solo mostrar botón si hay más de 1 pozo */}
              {form.pozos.length > 1 && (
                <button className="danger small" onClick={() => removePozo(i)}>
                  ✖ Quitar
                </button>
              )}
            </div>
          </div>
        ))}
        <button className="ghost small" onClick={addPozo}>
          ➕ Agregar Pozo
        </button>
        <h3>JSON de Planta</h3> 
        <div className="field">
          <input type="file" accept=".json" onChange={handleJson} />
        </div>
        <h3>PDF Técnico (obligatorio)</h3>
        <div className="field">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files[0])}
          />
          <span className="hint">Debe ser un archivo PDF válido</span>
        </div>
        <div className="actions">
          <button className="primary" onClick={submit}>
            Registrar Planta
          </button>
        </div>
      </div>
    </section>
  );
}
