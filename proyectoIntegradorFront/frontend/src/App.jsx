import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useApp } from "./context/AppContext";
import Notificaciones from "./pages/Notificaciones";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pendientes from "./pages/Pendientes";
import Registrar from "./pages/Registrar";
import Historial from "./pages/Historial";
import Auditar from "./pages/Auditar";
import PaqueteDetalle from "./pages/PaqueteDetalle";
import EditarPaquete from "./pages/EditarPaquete";
import Aprobados from "./pages/Aprobados";
import Ayuda from "./pages/Ayuda";
import CrearPlanta from "./pages/CrearPlanta";

import "./styles.css";

export default function App() {
  const { instance, accounts } = useMsal();
  const { setUser, user } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const init = async () => {
    try {
      await instance.initialize();

      const redirectResponse = await instance.handleRedirectPromise();

      if (redirectResponse?.account) {
        instance.setActiveAccount(redirectResponse.account);
      }

      const account =
        instance.getActiveAccount() ||
        instance.getAllAccounts()[0];

      if (!account) {
        setUser(null);
        return;
      }

      instance.setActiveAccount(account);

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

      if (window.location.pathname === "/") {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error inicializando autenticacion:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  init();
}, [accounts, instance, navigate, setUser]);

  // ✅ evitar render mientras MSAL carga
  if (loading) {
    return <p>Cargando...</p>;
  }

  const isAuthenticated = !!user; // ✅ CLAVE

  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        {/* ✅ LOGIN */}
        <Route index element={<Login />} />

        {/* ✅ RUTAS PROTEGIDAS */}
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
          path="registrar"
          element={isAuthenticated ? <Registrar /> : <Navigate to="/" />}
        />

        <Route
          path="historial"
          element={isAuthenticated ? <Historial /> : <Navigate to="/" />}
        />
        <Route path="/auditar/:id" element={<Auditar />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />

        <Route path="/notificaciones" element={<Notificaciones />} />

        <Route path="/paquete/:id" element={<PaqueteDetalle />} />
        <Route path="/editar/:id" element={<EditarPaquete />} />

        <Route
            path="aprobados"
            element={
              isAuthenticated
                ? <Aprobados />
                : <Navigate to="/" />
            }
          />

          <Route path="/plantas/crear" element={<CrearPlanta />} />

        <Route
          path="ayuda"
          element={isAuthenticated ? <Ayuda /> : <Navigate to="/" />}
        />

      </Route>
    </Routes>
  );
}
