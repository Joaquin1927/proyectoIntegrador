import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Historial() {
  const { user } = useApp();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [historial, setHistorial] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    if (user === null) return;

    if (!user) navigate("/");
    else cargarHistorial();
  }, [user]);

  const cargarHistorial = async () => {
    try {
      const res = await fetch(`${API}/paquetes/aceptados`);
      const data = await res.json();
      setHistorial(data);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <section className="panel">
      <h1>Historial de paquetes aceptados</h1>

      {historial.length === 0 ? (
        <p className="muted">No hay paquetes aceptados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Planta</th>
              <th>Fecha</th>
              <th>Volumen</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {historial.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.planta?.nombre}</td>
                <td>{p.captureDate}</td>
                <td>{p.tonCO2eq?.toFixed(3)}</td>

                <td>
                  <button onClick={() => setSeleccionado(p)}>
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ MODAL SOLO LECTURA */}
      {seleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h2>Detalle del paquete</h2>

            <p><b>ID:</b> {seleccionado.id}</p>
            <p><b>Planta:</b> {seleccionado.planta?.nombre}</p>
            <p><b>Fecha:</b> {seleccionado.captureDate}</p>
            <p><b>Volumen:</b> {seleccionado.tonCO2eq}</p>
            <p><b>Estado:</b> {seleccionado.estado}</p>

            <button onClick={() => setSeleccionado(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}