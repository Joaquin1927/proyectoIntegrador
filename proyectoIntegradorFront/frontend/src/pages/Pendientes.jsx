import { useEffect } from "react";
import { useApp } from "../context/AppContext";

export default function Pendientes() {
  const { paquetes, setPaquetes, user } = useApp();

  useEffect(() => {
    if (!user || !["auditor", "admin"].includes(user.role)) {
      window.location.hash = "#login";
    }
  }, [user]);

  if (!user) return null;

  const pendientes = paquetes.filter(p =>
    ["pendiente", "en_revision"].includes(p.estado)
  );

  const updateEstado = (id, nuevoEstado) => {
    setPaquetes(
      paquetes.map(p =>
        p.id === id ? { ...p, estado: nuevoEstado } : p
      )
    );
  };

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
              <th>Pureza</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pendientes.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.plantaNombre}</td>
                <td>{p.fecha} {p.hora}</td>
                <td>{p.volumenTon.toFixed(3)}</td>
                <td>{p.pureza.toFixed(1)}%</td>
                <td>
                  <span className={`badge ${p.estado}`}>
                    {p.estado}
                  </span>
                </td>
                <td>
                  <button
                    className="small"
                    onClick={() => updateEstado(p.id, "en_revision")}
                  >
                    En revisión
                  </button>
                  <button
                    className="small"
                    onClick={() => updateEstado(p.id, "aprobado")}
                  >
                    Aprobar
                  </button>
                  <button
                    className="small danger"
                    onClick={() => updateEstado(p.id, "rechazado")}
                  >
                    Rechazar
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