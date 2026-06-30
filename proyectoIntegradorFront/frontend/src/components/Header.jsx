import { useApp } from "../context/AppContext";
import { useState, useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Header() {
  const API = import.meta.env.VITE_API_URL;
  const { user, logout: logoutContext, notificaciones, reloadNotificaciones } = useApp();

  const { instance } = useMsal();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [dropdownNotifs, setDropdownNotifs] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);

  const dropdownRef = useRef(null);

  // 🔔 calcular no leídas
  useEffect(() => {
    const nuevas = notificaciones.filter((n) => !n.leido);
    setDropdownNotifs(nuevas);
    setNoLeidas(nuevas.length);
  }, [notificaciones]);

  // cerrar al hacer click afuera
  useEffect(() => {
  function handleClickOutside(event) {
    if (!open) return; // 👈 si no está abierto, no cierres nada

    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      cerrarDropdown();
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [open]);


  const cerrarDropdown = async () => {
    setOpen(false);

    if (user?.email) {
      await axios.post(`${API}/notificaciones/leer/${user.email}`);
      await reloadNotificaciones(); // 👈 recarga contexto
    }

    setDropdownNotifs([]);
  };

  const toggleDropdown = async () => {
    if (!open) {
      setOpen(true);
      setNoLeidas(0);
      return;
    }

    cerrarDropdown();
  };

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
        {user && (
          
          <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
            <button className="ghost" onClick={(e) => {
             e.stopPropagation(); // 👈 evita que el click se considere afuera
             toggleDropdown();
              }}>
              🔔
              {noLeidas > 0 && <span className="badge">{noLeidas}</span>}
            </button>

            {open && (
              <div
                className="dropdown"
                style={{
                  position: "absolute",
                  top: "40px",
                  right: 0,
                  width: "300px",
                  background: "#1e1e1e",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  padding: "10px",
                  zIndex: 1000,
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
                }}
              >
                {dropdownNotifs.length === 0 ? (
                  <p>No hay notificaciones nuevas</p>
                ) : (
                  dropdownNotifs.map((n) => (
                    <div key={n.id}>
                      <p>{n.mensaje}</p>
                      <small>{new Date(n.fecha).toLocaleString()}</small>
                      <button
                        onClick={() => {
                          navigate(`/paquete/${n.paqueteId}`);
                          cerrarDropdown();
                        }}
                      >
                        Ver
                      </button>
                    </div>
                  ))
                )}

                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => navigate("/notificaciones")}>
                    Ver todas
                  </button>
                </div>
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
