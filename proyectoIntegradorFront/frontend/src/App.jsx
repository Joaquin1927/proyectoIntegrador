import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { msalInstance } from "./auth/msalConfig";
import { useApp } from "./context/AppContext";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Registrar from "./pages/Registrar";
import Pendientes from "./pages/Pendientes";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const { setUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      await msalInstance.initialize();

      const response = await msalInstance.handleRedirectPromise();

      // ✅ si vuelve de Azure
      if (response) {
        const token = response.accessToken;

        console.log("TOKEN OK:", token);

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

        // ✅ redirigir después de login
        navigate("/dashboard");
      }
    };

    init();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Login />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="registrar" element={<Registrar />} />
        <Route path="pendientes" element={<Pendientes />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}