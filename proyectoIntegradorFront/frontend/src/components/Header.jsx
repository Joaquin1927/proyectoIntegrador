import { useApp } from "../context/AppContext";
import { useState, useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, ChevronRight, Inbox, LogOut } from "lucide-react";

export default function Header() {
  const API = import.meta.env.VITE_API_URL;
  const {
    user,
    logout: logoutContext,
    notificaciones,
    reloadNotificaciones,
  } = useApp();

  const { instance, accounts } = useMsal();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownNotifs = notificaciones.filter((notification) => !notification.leido);
  const noLeidas = dropdownNotifs.length;

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user?.email) return;

    reloadNotificaciones();

    const interval = setInterval(() => {
      reloadNotificaciones();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

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

  async function cerrarDropdown() {
    console.log("CERRANDO DROPDOWN");
    setOpen(false);
    if (user?.email) {
      console.log("MARCANDO LEIDAS");
      const response = await instance.acquireTokenSilent({
        scopes: ["api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"],
        account: accounts[0],
      });
      const token = response.accessToken;
      await axios.post(
        `${API}/notificaciones/leer/${user.email}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      await reloadNotificaciones();
    }
  }

  const toggleDropdown = async () => {
    if (!open) {
      setOpen(true);
      //setNoLeidas(0);
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
          <div ref={dropdownRef} className="notification-center">
            <button
              className="ghost"
              onClick={(e) => {
                e.stopPropagation(); // 👈 evita que el click se considere afuera
                toggleDropdown();
              }}
            >
              <Bell size={17} />
              {noLeidas > 0 && <span className="badge">{noLeidas}</span>}
            </button>

            {open && (
              <div className="notification-dropdown">
                <header><div><span>NOTIFICACIONES</span><strong>{noLeidas} nuevas</strong></div></header>
                {dropdownNotifs.length === 0 ? (
                  <div className="notification-empty"><Inbox size={22} /><p>No hay notificaciones nuevas</p></div>
                ) : (
                  dropdownNotifs.map((n) => (
                    <div className="notification-item" key={n.id}>
                      <div><p>{n.mensaje}</p><small>{new Date(n.fecha).toLocaleString("es-UY")}</small></div>
                      <button
                        onClick={() => {
                          console.log("ROL:", user.role);
                          if (user.role?.toLowerCase() === "auditor") {
                            console.log("VOY A AUDITORIA");
                            navigate(`/auditar/${n.paqueteId}`);
                          } else {
                            console.log("VOY A DETALLE");
                            navigate(`/paquete/${n.paqueteId}`);
                          }
                          cerrarDropdown();
                        }}
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  ))
                )}

                <button className="notification-all" onClick={() => navigate("/notificaciones")}>Ver todas las notificaciones</button>
              </div>
            )}
          </div>
        )}

        <div className="user-pill">{user ? user.email : "Invitado"}</div>

        {user && (
          <button className="danger small logout-button" onClick={handleLogout}><LogOut size={14} /> Cerrar sesión</button>
        )}
      </div>
    </header>
  );
}
