import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useApp } from "./context/AppContext";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pendientes from "./pages/Pendientes";
import Registrar from "./pages/Registrar";
import Home from "./pages/Home";
import "./styles.css";

export default function App() {
  const { instance } = useMsal();
  const { setUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const accountsList = instance.getAllAccounts();

      // ✅ Si NO está logueado → ir a login
      if (accountsList.length === 0) {
        navigate("/");
        return;
      }

      // ✅ Si está logueado → obtener token
      const account = accountsList[0];

      try {
        const response = await instance.acquireTokenSilent({
          scopes: [import.meta.env.VITE_SCOPE],
          account,
        });

        const token = response.accessToken;

        localStorage.setItem("token", token);

        const payload = JSON.parse(atob(token.split(".")[1]));
        const roles = payload.roles || [];

        let role = "empleado";
        if (roles.includes("ADMIN")) role = "admin";
        else if (roles.includes("AUDITOR")) role = "auditor";

        setUser({
          email: payload.upn || payload.unique_name,
          role,
        });

        // ✅ redirigir solo si está logueado
        navigate("/dashboard");

      } catch (error) {
        console.error("Error obteniendo token:", error);

        // ✅ si falla, volver a login
        navigate("/");
      }
    };

    init();
  }, [instance, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        
        {/* ✅ Login */}
        <Route index element={<Login />} />

        {/* ✅ Rutas protegidas */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="registrar" element={<Registrar />} />
        <Route path="pendientes" element={<Pendientes />} />
        <Route path="home" element={<Home />} />

        {/* ✅ fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}