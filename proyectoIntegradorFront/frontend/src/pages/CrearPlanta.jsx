import { useState } from "react";
import axios from "../api/axios";

export default function CrearPlanta() {
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    direccion: "",
    managerEmail: "",
    latitud: "",
    longitud: "",
    metadata: "{}",
    pozos: [{ nombre: "" }],
  });

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

  const validar = () => {
    if (!form.nombre.trim()) return "El nombre de la planta es obligatorio";
    if (!form.empresa.trim()) return "El nombre de la empresa es obligatorio";
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
      const fd = new FormData();
      fd.append(
        "data",
        new Blob([JSON.stringify(form)], { type: "application/json" }),
      );
      fd.append("pdf", pdf);

      await axios.post("http://localhost:8080/plantas", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Planta registrada correctamente");

      setForm({
        nombre: "",
        empresa: "",
        direccion: "",
        managerEmail: "",
        latitud: "",
        longitud: "",
        metadata: "{}",
        pozos: [{ nombre: "" }],
      });

      setPdf(null);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Error al registrar la planta");
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
            <input
              value={form.empresa}
              onChange={(e) => updateField("empresa", e.target.value)}
            />
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

          <div className="field">
            <label>Latitud (opcional)</label>
            <input
              value={form.latitud}
              onChange={(e) => updateField("latitud", e.target.value)}
            />
          </div>

          <div className="field">
            <label>Longitud (opcional)</label>
            <input
              value={form.longitud}
              onChange={(e) => updateField("longitud", e.target.value)}
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

        <h3>PDF Técnico (obligatorio)</h3>
        <div className="field">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files[0])}
          />
          <span className="hint">Debe ser un archivo PDF válido</span>
        </div>

        <h3>Metadata JSON</h3>
        <div className="field">
          <textarea
            rows={6}
            value={form.metadata}
            onChange={(e) => updateField("metadata", e.target.value)}
          />
          <span className="hint">Debe ser JSON válido</span>
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
