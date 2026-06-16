import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import axios from "axios";
import { useMsal } from "@azure/msal-react";


export default function Auditar() {
  const API = import.meta.env.VITE_API_URL;
  const { user } = useApp(); // ✅ SOLO USER del contexto
  const navigate = useNavigate();
  const { id } = useParams();
  const { instance, accounts } = useMsal();


  
  const [paquete, setPaquete] = useState(null);



const aprobar = async () => {
  try {
    const response = await instance.acquireTokenSilent({
      scopes: ["api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"],
      account: accounts[0]
    });

    const token = response.accessToken;
console.log(atob(token.split('.')[1]))
    await axios.post(
      `${API}/paquetes/${id}/aprobar`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("✅ Paquete aprobado");
    navigate("/pendientes");

  } catch (err) {
    console.error(err.response?.data || err);
    alert("Error al aprobar");
  }
};




const rechazar = async () => {
  try {
    const response = await instance.acquireTokenSilent({
      scopes: ["api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"],
      account: accounts[0]
    });

    const token = response.accessToken;

    await axios.post(
      `${API}/paquetes/${id}/rechazar`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("❌ Paquete rechazado");
    navigate("/pendientes");

  } catch (err) {
    console.error(err.response?.data || err);
    alert("Error al rechazar paquete");
  }
};

  const [loading, setLoading] = useState(false);

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

  const metadata = paquete?.metadata ? JSON.parse(paquete.metadata) : {};
  const volumen = paquete.tonCO2eq ?? metadata.tonCO2eq;

  return (
    <div className="panel">
      <h2>Auditar paquete {paquete.id}</h2>

      <p>
        <strong>Planta:</strong> {paquete.planta.nombre}
      </p>
      <p>
        <strong>CO₂:</strong> {volumen}
      </p>

      <h3>Datos adicionales</h3>

      {Object.entries(metadata).map(([key, val]) => (
        <p key={key}>
          <strong>{key}:</strong> {val}
        </p>
      ))}

      <button onClick={aprobar} disabled={loading}>
        ✅ Aprobar
      </button>

      <button onClick={rechazar} disabled={loading}>
        ❌ Rechazar
      </button>

      <button onClick={() => navigate("/dashboard")}>Volver</button>
    </div>
  );
}
