import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import axios from "axios";

export default function Auditar() {

  const API = "http://localhost:8080";

  const { user } = useApp();   // ✅ SOLO USER del contexto
  const navigate = useNavigate();
  const { id } = useParams();

  const [paquete, setPaquete] = useState(null);

  // ✅ 1. VALIDAR ROL

useEffect(() => {
  if (!user) return;

  if (user.role.toLowerCase() !== "auditor") {
    alert("acceso exclusivo para auditores");
    navigate("/dashboard");
  }

}, [user]);

// ✅ bloquear render
if (!user) return <p>Cargando...</p>;

if (user.role.toLowerCase() !== "auditor") {
  return null; // 👈 evita que se vea la pantalla
}


  // ✅ 2. TRAER EL PAQUETE POR ID (ACÁ VA EL useEffect que te dije)
  useEffect(() => {
    console.log("Buscando paquete ID:", id);

    axios
      .get(`${API}/paquetes/${id}`)
      .then((res) => {
        console.log("PAQUETE:", res.data);
        setPaquete(res.data);
      })
      .catch((err) => {
        console.error("Error cargando paquete", err);
      });

  }, [id]);

  if (!paquete) return <p>Cargando...</p>;

  const metadata = paquete?.metadata
    ? JSON.parse(paquete.metadata)
    : {};

  return (
    <div className="panel">
      <h2>Auditar paquete {paquete.id}</h2>

      <p><strong>Planta:</strong> {paquete.plantaId}</p>
      <p><strong>CO₂:</strong> {paquete.ton_co2eq}</p>

      <h3>Datos adicionales</h3>

      {Object.entries(metadata).map(([key, val]) => (
        <p key={key}>
          <strong>{key}:</strong> {val}
        </p>
      ))}

      <button>✅ Aprobar</button>
      <button>❌ Rechazar</button>

      <button onClick={() => navigate("/dashboard")}>
        Volver
      </button>
    </div>
  );
}
