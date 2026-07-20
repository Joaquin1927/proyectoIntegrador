import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export default function Notificaciones() {
  const API = import.meta.env.VITE_API_URL;
  const { instance, accounts } = useMsal();
  const { user } = useApp();
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    const cargarNotificaciones = async () => {
      try {
        const response = await instance.acquireTokenSilent({
          scopes: [import.meta.env.VITE_SCOPE],
          account: accounts[0],
        });
        const token = response.accessToken;
        const res = await axios.get(`${API}/notificaciones/${user.email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotificaciones(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    cargarNotificaciones();
  }, [user, instance, accounts]);

  if (!user) return <p>Cargando...</p>;

  return (
    <div className="panel">
      <h2>Notificaciones</h2>

      {notificaciones.map((n) => (
        <div key={n.id}>
          <p>{n.mensaje}</p>
          <small>{new Date(n.fecha).toLocaleString()}</small>

          <button
            onClick={() =>
              navigate(
                user.rol === "auditor"
                  ? `/auditar/${n.paqueteId}`
                  : `/paquete/${n.paqueteId}`,
              )
            }
          >
            Ver
          </button>
        </div>
      ))}
    </div>
  );
}
