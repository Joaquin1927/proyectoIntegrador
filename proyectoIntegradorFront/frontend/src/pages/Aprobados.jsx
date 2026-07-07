import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Aprobados() {
  const { user } = useApp();

  const navigate = useNavigate();

  const [aprobados, setAprobados] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user) return;

    if (user.role.toLowerCase() !== "admin") {
      alert("acceso exclusivo para administradores");
      navigate("/dashboard");
    } else {
      cargarAprobados();
    }
  }, [user]);

  const cargarAprobados = async () => {
    try {
      const res = await fetch(`${API}/paquetes/aprobados`);

      const data = await res.json();

      console.log("PAQUETES APROBADOS:", data);

      setAprobados(data);
    } catch (err) {
      console.error("Error cargando aprobados:", err);
    }
  };

  const mintear = async (id) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/paquetes/${id}/mint`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Error al mintear");
      }

      alert("Paquete minteado correctamente");

      cargarAprobados();
    } catch (err) {
      console.error(err);
      alert("Error al mintear");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Cargando...</p>;

  if (user.role.toLowerCase() !== "admin") {
    return null;
  }

  return (
    <section className="panel">
      <h1>Paquetes aprobados</h1>

      {aprobados.length === 0 ? (
        <p className="muted">
          No hay paquetes aprobados.
        </p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Planta</th>
              <th>Ton CO₂</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {aprobados.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.planta?.nombre}</td>
                <td>{Number(p.tonCO2eq || 0).toFixed(3)}</td>
                <td>{p.estado}</td>
                <td>
                  <button
                    disabled={loading}
                    onClick={() => mintear(p.id)}
                  >
                    Mintear
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