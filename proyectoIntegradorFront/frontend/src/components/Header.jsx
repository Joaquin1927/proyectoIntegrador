import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, setUser } = useApp();
   const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">CO2X</div>
        <div className="subtitle">Plataforma dMRV • Demo</div>
      </div>

      <div className="top-actions">
        <button className="ghost" title="Alternar tema">
          🌓
        </button>

        <div className="user-pill">
          {user ? `${user.name} · ${user.role}` : "Invitado"}
        </div>

        {user && (
          <button
            className="danger small"
            onClick={logout}
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  );
}