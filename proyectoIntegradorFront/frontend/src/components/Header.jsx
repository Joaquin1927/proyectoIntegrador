import { useApp } from "../context/AppContext";
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Header() {

  const API = import.meta.env.VITE_API_URL;

  const { user, logout: logoutContext } = useApp();
  const { instance } = useMsal();
  const navigate = useNavigate();

  // ✅ estado de notificaciones
  const [notificaciones, setNotificaciones] = useState([]);

  // ✅ cargar notificaciones cuando hay user
  useEffect(() => {
    if (!user?.email) return;

    axios
      .get(`${API}/notificaciones/${user.email}`)
      .then(res => {
        console.log("NOTIFICACIONES:", res.data);
        setNotificaciones(res.data);
      })
      .catch(err => console.error("Error notific.", err));

  }, [user]);

  const handleLogout = () => {
    logoutContext();

    localStorage.removeItem("token");

    instance.setActiveAccount(null);

    window.location.href = "/";
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">CO2X</div>
        <div className="subtitle">Plataforma dMRV • Demo</div>
      </div>

      <div className="top-actions">

        {/* ✅ SOLO SI ESTÁ LOGUEADO */}
        {user && (
          <button
            className="ghost"
            onClick={() => navigate("/notificaciones")}
          >
            🔔 {notificaciones.length > 0 && `(${notificaciones.length})`}
          </button>
        )}

        <button className="ghost">🌓</button>

        <div className="user-pill">
          {user ? user.email : "Invitado"}
        </div>

        {user && (
          <button className="danger small" onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  );
}