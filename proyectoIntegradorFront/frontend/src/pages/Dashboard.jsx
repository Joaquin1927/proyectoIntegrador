import { useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { paquetes } = useApp();
  const { accounts } = useMsal();
  const navigate = useNavigate();

  const user = accounts[0];
  const canvasRef = useRef(null);

  // Si no hay usuario, mostrar botón de login
  if (!user) {
    return (
      <section className="panel">
        <h1>Dashboard</h1>
        <p>Para ver tus datos, iniciá sesión.</p>
        <button onClick={() => navigate("/login")}>Iniciar sesión</button>
      </section>
    );
  }

  // ... resto de tu código original del Dashboard ...
}
