import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { msalInstance } from "./auth/msalConfig";
import { useApp } from "./context/AppContext";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pendientes from "./pages/Pendientes";
import Home from "./pages/Home";
import "./styles.css";

import { useApp } from "./context/AppContext";

export default function App() {
<<<<<<< HEAD
  const { user } = useApp();

  return (
    <Routes>
      {/* Dashboard como página principal */}
      <Route path="/" element={<Dashboard />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Home después del login */}
      <Route path="/home" element={<Home />} />

      {/* Rutas protegidas dentro del layout */}
      <Route path="/app" element={<Layout />}>
        <Route
          path="dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />

        <Route
          path="pendientes"
          element={user ? <Pendientes /> : <Navigate to="/login" replace />}
        />
=======
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
>>>>>>> develop
      </Route>
    </Routes>
  );
}
