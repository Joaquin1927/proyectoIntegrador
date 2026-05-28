import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Registrar from "./pages/Registrar";
import Pendientes from "./pages/Pendientes";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
  <Route path="/" element={<Layout />}>
    <Route index element={<Login />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="pendientes" element={<Pendientes />} />
  </Route>
  );
}