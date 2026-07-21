import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegistrarEmpresa() {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    numeroCorporacion: "",
    numeroEmpresa: "",
    direccion: "",
    directores: "",
    contacto: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // 🔐 Obtener token MSAL
    const response = await instance.acquireTokenSilent({
      scopes: [import.meta.env.VITE_SCOPE],
      account: accounts[0],
    });

    const token = response.accessToken;

    // 📡 Enviar empresa al backend
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/empresas`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Empresa registrada correctamente");
    navigate("/dashboard");

  } catch (err) {
    console.error(err);
    alert("Error al registrar empresa: " + err.message);
  }
};

  return (
    <div className="page-container form-wrapper">
      {/* TÍTULO PRINCIPAL */}
      <div className="form-header">
        <div className="form-icon">🏢</div>
        <h1 className="form-title">Registrar Empresa</h1>
      </div>

      {/* SECCIÓN 01 */}
      <div className="form-section">
        <h2 className="section-title">01 — Información general</h2>
        <p className="section-subtitle">
          Identificación y datos principales de la empresa
        </p>

        <form onSubmit={handleSubmit} className="form-grid">

          <div className="form-field">
            <label>Nombre de la empresa</label>
            <input
              type="text"
              name="nombre"
              placeholder="Ej. CO2X Corp"
              value={form.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Número de corporación</label>
            <input
              type="text"
              name="numeroCorporacion"
              placeholder="Ej. 12345"
              value={form.numeroCorporacion}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Número de empresa</label>
            <input
              type="text"
              name="numeroEmpresa"
              placeholder="Ej. 67890"
              value={form.numeroEmpresa}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              placeholder="Dirección de la empresa"
              value={form.direccion}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Directores</label>
            <input
              type="text"
              name="directores"
              placeholder="Ej. Juan Pérez, Ana Gómez"
              value={form.directores}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Contacto</label>
            <input
              type="text"
              name="contacto"
              placeholder="Teléfono o email de contacto"
              value={form.contacto}
              onChange={handleChange}
            />
          </div>

          <button className="submit-btn" type="submit">
            Registrar Empresa
          </button>
        </form>
      </div>
    </div>
  );
}
