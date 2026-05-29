import { useMsal } from "@azure/msal-react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const { accounts } = useMsal();

  const user = accounts[0];

  return (
    <aside className="sidebar">
      <nav>
        {!user && (
          <Link to="/login" className="nav-item">
            Iniciar sesión
          </Link>
        )}

        {user && (
          <>
            <Link
              to="/dashboard"
              className="nav-item"
            >
              📈 Dashboard
            </Link>

            <Link
              to="/pendientes"
              className="nav-item"
            >
              📋 Pendientes
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}