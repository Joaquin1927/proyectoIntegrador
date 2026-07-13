import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Sidebar() {
  const { user } = useApp();

  console.log("USER COMPLETO:", user);

  if (user) {
    console.log("USER EMAIL:", user.email);
    console.log("USER ROLE:", user.role);
  }

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

            <Link to="/historial" className="nav-item">
              🔎 Consultar paquetes
            </Link>

            {/* ✅ SOLO AUDITOR */}
            {user.role === "auditor" && (
              <Link to="/pendientes" className="nav-item">
                📋 Pendientes
              </Link>
            )}

            {/* ✅ SOLO EMPLEADO */}
            {user.role === "empleado" && (
              <>
                <Link to="/registrar" className="nav-item">
                  ➕ Registrar
                </Link>
              </>
            )}

            {/* ✅ SOLO ADMIN */}
            {user.role === "admin" && (
              <Link to="/aprobados" className="nav-item">
                ⛓️ Mintear Tokens
              </Link>
            )}

            <div className="nav-sep" />
            <Link to="/ayuda" className="nav-item">
              ❔ Ayuda / Acerca de
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
