import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pendientes from "./pages/Pendientes";
import Home from "./pages/Home";
import "./styles.css";

import { useApp } from "./context/AppContext";

export default function App() {
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
      </Route>
    </Routes>
  );
}
