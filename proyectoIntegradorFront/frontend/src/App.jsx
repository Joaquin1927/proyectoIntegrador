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
  const { instance, accounts } = useMsal();
  const { setUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (accounts.length === 0) return;

      const account = accounts[0];

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

        navigate("/dashboard");

      } catch (error) {
        console.error("Error obteniendo token:", error);
      }
    };

    init();
  }, [accounts, instance, navigate]);

  // ✅ usar accounts
  const isAuthenticated = accounts.length > 0;

  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        <Route index element={<Login />} />

        <Route
          path="dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="registrar"
          element={isAuthenticated ? <Registrar /> : <Navigate to="/" />}
        />
        <Route
          path="pendientes"
          element={isAuthenticated ? <Pendientes /> : <Navigate to="/" />}
        />
        <Route
          path="home"
          element={isAuthenticated ? <Home /> : <Navigate to="/" />}
        />

        <Route path="*" element={<Navigate to="/" />} />

      </Route>
    </Routes>
  );
}