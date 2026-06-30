import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Historial() {
  const { user } = useApp();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [historial, setHistorial] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const cargarHistorial = async () => {
    try {
      const res = await fetch(`${API}/paquetes`);
      const data = await res.json();

      const propios = data.filter((p) => p.createdBy === user.email);

      setHistorial(propios);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  useEffect(() => {
    if (user === null) return;

    if (!user) navigate("/");
    if (user.role.toLowerCase() !== "empleado") {
      navigate("/");
      return;
    } else cargarHistorial();
  }, [user]);

  if (!user) return <p>Cargando...</p>;

  return (
    <section className="panel">
      <h1>Historial de paquetes</h1>

      {historial.length === 0 ? (
        <p className="muted">No hay paquetes registrados.</p>
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
            {historial.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.planta?.nombre}</td>
                <td>{p.captureDate}</td>
                <td>{p.tonCO2eq?.toFixed(3)}</td>
                <td>{p.estado}</td>
                <td>
                  <button onClick={() => navigate(`/paquete/${p.id}`)}>
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
