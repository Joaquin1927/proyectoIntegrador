import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Sidebar() {
  const { user } = useApp(); // ✅ FIX

  return (
    <aside className="sidebar">
      <nav>
        {!user && (
          <Link to="/" className="nav-item">
            Iniciar sesión
          </Link>
        )}

        {user && (
          <>
            <Link to="/dashboard" className="nav-item">
              📈 Dashboard
            </Link>

            <Link to="/pendientes" className="nav-item">
              📋 Pendientes
            </Link>

            <Link to="/registrar" className="nav-item">
              ➕ Registrar
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}