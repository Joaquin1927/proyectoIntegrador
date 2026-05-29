import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { instance, accounts } = useMsal();

  const navigate = useNavigate();

  const user = accounts[0];

  const logout = async () => {
    await instance.logoutPopup();
    navigate("/");
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">CO₂X</div>
        <div className="subtitle">
          Plataforma dMRV • Demo
        </div>
      </div>

      <div className="top-actions">
        <button
          className="ghost"
          title="Alternar tema"
        >
          🌓
        </button>

        <div className="user-pill">
          {user ? user.name : "Invitado"}
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