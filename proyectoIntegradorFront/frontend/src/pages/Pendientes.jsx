import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import PaqueteModal from "../components/PaqueteModal";

export default function Pendientes() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [pendientes, setPendientes] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user === null) return;

    if (!user) {
      navigate("/");
    } else {
      cargarPendientes();
    }
  }, [user]);

  const cargarPendientes = async () => {
    try {
      const res = await fetch(`${API}/paquetes/pendientes`);
      const data = await res.json();
      setPendientes(data);
    } catch (err) {
      console.error("Error cargando pendientes:", err);
    }
  };

  const aceptarPaquete = async () => {
    if (!seleccionado) return;

    try {
      setLoading(true);

      // ✅ PUT → cambiar estado
      await fetch(`${API}/paquetes/${seleccionado.id}/aceptar`, {
        method: "PUT"
      });

      // ✅ POST → crear reporte
      await fetch(`${API}/reportes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paqueteId: seleccionado.id
        })
      });

      setSeleccionado(null);
      cargarPendientes();

    } catch (err) {
      console.error("Error al aceptar paquete:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <section className="panel">
      <h1>Pendientes de auditoría</h1>

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
            {pendientes.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.planta?.nombre}</td>
                <td>{p.captureDate}</td>
                <td>{p.tonCO2eq?.toFixed(3)}</td>

                <td>
                  <span className={`badge ${p.estado}`}>
                    {p.estado}
                  </span>
                </td>

                <td>
                  <button
                    className="small"
                    onClick={() => setSeleccionado(p)}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ MODAL LIMPIO */}
      <PaqueteModal
        paquete={seleccionado}
        onClose={() => setSeleccionado(null)}
        onAceptar={aceptarPaquete}
        loading={loading}
      />
    </section>
  );
}