import { useApp } from "../context/AppContext";
import { useMsal } from "@azure/msal-react";

export default function Header() {
  const { user, logout: logoutContext } = useApp();
  const { instance } = useMsal();

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