import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import axios from "axios";
export default function RegistrarEmpresa() {
  const API = import.meta.env.VITE_API_URL;

  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!nombre.trim()) {
      setError("El nombre de la empresa es obligatorio");
      return;
    }

    try {
      setLoading(true);

      const response = await instance.acquireTokenSilent({
        scopes: [import.meta.env.VITE_SCOPE],
        account: accounts[0],
      });
      const token = response.accessToken;
      const res = await axios.post(
        `${API}/empresas`,
        { nombre },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = res.data;
      setSuccess(`Empresa '${data.nombre}' registrada correctamente`);

      // Opcional: redirigir después de 1.5s
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
        <label>Nombre de la empresa</label>
        <input
          type="text"
          placeholder="Ej: CO2X Corp"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Registrar Empresa"}
        </button>
      </form>
    </div>
  );
}
