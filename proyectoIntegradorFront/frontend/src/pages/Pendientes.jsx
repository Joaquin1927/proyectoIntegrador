import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { apiGet } from "../api/apiClient";

export default function Pendientes() {
  const { user, plantas } = useApp();

  const [plantaSeleccionada, setPlantaSeleccionada] = useState(null);

  const navigate = useNavigate();

  const [pendientes, setPendientes] = useState([]);

  const API = import.meta.env.VITE_API_URL;
  const userRole = user?.role?.toLowerCase();

  async function cargarPendientes() {
    try {
      const res = await apiGet(`${API}/paquetes/pendientes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPendientes(data);
    } catch (err) {
      console.error("Error cargando pendientes:", err);
    }
  }

  useEffect(() => {
    if (!userRole) return;
    if (userRole !== "auditor") {
      navigate("/dashboard");
      return;
    }

    let active = true;
    const refresh = () => {
      if (active) cargarPendientes();
    };

    refresh();
    const interval = setInterval(refresh, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [API, navigate, userRole]);

  const pendientesFiltrados = plantaSeleccionada
    ? pendientes.filter((p) => p.planta.id === plantaSeleccionada)
    : pendientes;

  if (!user) return <p>Cargando...</p>;
  if (userRole !== "auditor") return null;

  return (
    <section className="panel">
      <h1>Pendientes de auditoría</h1>

      <select
        value={plantaSeleccionada ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          setPlantaSeleccionada(value === "" ? null : Number(value));
        }}
      >
        <option value="">Todas las plantas</option>

        {plantas?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>

      {pendientes.length === 0 ? (
        <p className="muted">No hay paquetes pendientes.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Planta</th>
              <th>Fecha</th>
              <th>Volumen</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {pendientesFiltrados.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.planta?.nombre}</td>
                <td>{p.captureDate}</td>
                <td>{Number(p.tonCO2eq || 0).toFixed(3)}</td>

                <td>
                  <div className="estado-wrapper">
                    <span>{p.estado}</span>

                    {p.numeroRevision > 1 && (
                      <span className="revision-badge">{p.numeroRevision}</span>
                    )}
                  </div>
                </td>

                <td>
                  <button onClick={() => navigate(`/auditar/${p.id}`)}>
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </section>
  );
}
