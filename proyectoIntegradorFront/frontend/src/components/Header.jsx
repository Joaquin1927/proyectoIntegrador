import { useApp } from "../context/AppContext";
import { useMsal } from "@azure/msal-react";

export default function Header() {
  const { user, logout: logoutContext } = useApp();
  const { instance, accounts } = useMsal();

  const handleLogout = async () => {
    logoutContext();

    await instance.logoutRedirect({
      account: accounts[0],
      postLogoutRedirectUri: import.meta.env.VITE_REDIRECT_URI,
    });
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