import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistrarEmpresa() {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

      const res = await fetch("http://localhost:8080/empresas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Error al registrar empresa");
      }

      const data = await res.json();
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
