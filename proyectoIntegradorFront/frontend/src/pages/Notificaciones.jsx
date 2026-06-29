import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Notificaciones() {
  const API = import.meta.env.VITE_API_URL;
  const { user } = useApp();
  const navigate = useNavigate();

  const [notificaciones, setNotificaciones] = useState([]);
  useEffect(() => {
    if (!user?.email) return;

    axios
      .get(`${API}/notificaciones/${user.email}`)
      .then((res) => {
        console.log("NOTIFICACIONES:", res.data);
        setNotificaciones(res.data);
      })
      .catch((err) => console.error(err));
  }, [user]);



  if (!user) return <p>Cargando...</p>;

  return (
    <div className="panel">
      <h2>Notificaciones</h2>

      {notificaciones.map((n) => (
        <div key={n.id}>
          <p>{n.mensaje}</p>

          <small>{new Date(n.fecha).toLocaleString()}</small>
          {console.log(n)}
          <button onClick={() => navigate(`/paquete/${n.paqueteId}`)}>
            Ver
            
          </button>
        </div>
      ))}
    </div>
  );
}
