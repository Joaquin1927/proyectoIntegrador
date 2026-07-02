import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { msalInstance } from "../auth/msalConfig";
import { apiGet } from "../api/apiClient";

export default function PaqueteDetalle() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [paquete, setPaquete] = useState(null);
  const [ultimoHistorial, setUltimoHistorial] = useState(null);

  // 🔥 1) FUNCIÓN PARA OBTENER EL TOKEN
  const obtenerToken = async () => {
    const account = msalInstance.getActiveAccount();
    if (!account) {
      console.error("No hay cuenta activa en MSAL");
      return null;
    }

    const response = await msalInstance.acquireTokenSilent({
      scopes: ["openid", "profile", "email"],
      account,
    });

    return response.accessToken;
  };

  // 🔥 2) USAR EL TOKEN EN EL FETCH
  const cargarUltimoHistorial = async () => {
  try {
    const res = await apiGet(`${API}/paquetes/${id}/historial/ultimo`);
    if (res.status === 204) {
      setUltimoHistorial(null);
      return;
    }
    const data = await res.json();
    setUltimoHistorial(data);
  } catch (err) {
    console.error("Error cargando historial:", err);
  }
};


  const cargarPaquete = async () => {
  try {
    const res = await apiGet(`${API}/paquetes/${id}`);
    const data = await res.json();
    setPaquete(data);
  } catch (err) {
    console.error("Error cargando paquete:", err);
  }
};



  useEffect(() => {
    if (!user) return;

    if (user.role.toLowerCase() !== "empleado") {
      navigate("/");
      return;
    }

    cargarPaquete();
    cargarUltimoHistorial();
  }, [user]);

  if (!paquete) return <p>Cargando...</p>;

  return <section className="panel">{/* resto del componente */}</section>;
}
