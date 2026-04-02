import { useApp } from "../context/AppContext";

export default function Header() {
  const { user, setUser } = useApp();

  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">CO₂X</div>
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
            onClick={() => setUser(null)}
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  );
}