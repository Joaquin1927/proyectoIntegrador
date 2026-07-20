import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import axios from "axios";

export default function RegistrarEmpresa() {
  const API = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    nombre: "",
    numeroCorporacion: "",
    numeroEmpresa: "",
    direccion: "",
    directores: "",
    contacto: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { instance, accounts } = useMsal();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.nombre.trim()) {
      setError("El nombre de la empresa es obligatorio");
      console.log("Error: El nombre de la empresa es obligatorio");
      return;
    }
    if (!form.numeroCorporacion.trim()) {
      setError("El número de corporación es obligatorio");
      console.log("Error: El número de corporación es obligatorio");
      return;
    }
    if (!form.numeroEmpresa.trim()) {
      setError("El número de empresa es obligatorio");
      console.log("Error: El número de empresa es obligatorio");
      return;
    }
    if (!form.direccion.trim()) {
      setError("La dirección es obligatoria");
      console.log("Error: La dirección es obligatoria");
      return;
    }
    if (!form.directores.trim()) {
      setError("Los directores son obligatorios");
      console.log("Error: Los directores son obligatorios");
      return;
    }
    if (!form.contacto.trim()) {
      setError("El contacto es obligatorio");
      console.log("Error: El contacto es obligatorio");
      return;
    }

    try {
      setLoading(true);

      const response = await instance.acquireTokenSilent({
        scopes: [import.meta.env.VITE_SCOPE],
        account: accounts[0],
      });

      const token = response.accessToken;
      console.log("📤 Enviando datos al backend:", JSON.stringify(form, null, 2));
      console.log("TOKEN ENVIADO: " + token);

      const res = await axios.post(`${API}/empresas`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Empresa registrada:", res.data);

      const data = res.data;
      setSuccess(`Empresa '${data.nombre}' registrada correctamente`);

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>🏢 Registrar Empresa</h1>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Número de corporación</label>
          <input
            name="numeroCorporacion"
            value={form.numeroCorporacion}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Número de empresa</label>
          <input
            name="numeroEmpresa"
            value={form.numeroEmpresa}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Directores</label>
          <input
            name="directores"
            value={form.directores}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Contacto</label>
          <input
            name="contacto"
            value={form.contacto}
            onChange={handleChange}
          />
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Registrar Empresa"}
        </button>
      </form>
    </div>
  );
}
