import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function Pendientes() {
  const { paquetes, setPaquetes, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
      if (user === null) return; // esperar

      if (!user) {
        navigate("/");
      }

    if (!["auditor", "admin"].includes(user.role)) {
      navigate("/dashboard");
    }
  }, [user]);

  if (!user) return <p>Cargando...</p>;

  // ✅ estados adaptados a main
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
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pendientes.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>

                {/* ✅ corregido */}
                <td>{p.planta?.nombre}</td>

                {/* ✅ corregido */}
                <td>{p.captureDate}</td>

                {/* ✅ corregido */}
                <td>{p.tonCO2eq?.toFixed(3)}</td>

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