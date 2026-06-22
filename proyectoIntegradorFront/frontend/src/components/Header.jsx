import { useApp } from "../context/AppContext";
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function Header() {
  const API = import.meta.env.VITE_API_URL;

  const { user, logout: logoutContext } = useApp();
  const { instance } = useMsal();
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  const [notificaciones, setNotificaciones] = useState([]);
  const [open, setOpen] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);
  
useEffect(() => {

  function handleClickOutside(event) {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setOpen(false); 
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };

}, []);

  useEffect(() => {
    if (!user?.email) return;

    axios
      .get(`${API}/notificaciones/${user.email}`)
      .then((res) => {
        console.log("NOTIFICACIONES:", res.data);
        setNotificaciones(res.data);
        setNoLeidas(res.data.filter((n) => !n.leido).length);
      })
      .catch((err) => console.error("Error notific.", err));
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
          <div ref={dropdownRef} style={{ position: "relative" }}>
            {/* 🔔 botón */}
            <button
              className="ghost"
              onClick={() => {
                setOpen(!open);
                setNoLeidas(0); // ✅ limpiar contador al abrir
              }}
              style={{ position: "relative" }}
            >
              🔔
              {/* 🔴 badge */}
              {noLeidas > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "12px",
                  }}
                >
                  {noLeidas}
                </span>
              )}
            </button>

            {/* ✅ dropdown */}
            {open && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "40px",
                  width: "300px",
                  background: "#1e1e1e",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  padding: "10px",
                  zIndex: 1000,
                }}
              >
                {notificaciones.length === 0 && <p>No hay notificaciones</p>}

                {notificaciones.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #333",
                      fontSize: "14px",
                    }}
                  >
                    <p>{n.mensaje}</p>

                    <button onClick={() => navigate(`/auditar/${n.paqueteId}`)}>
                      Ver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="user-pill">{user ? user.email : "Invitado"}</div>

        {user && (
          <button className="danger small" onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  );
}
