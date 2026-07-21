
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { AlertTriangle } from "lucide-react";

export default function Layout() {
  const { backendActivo } = useContext(AppContext);

  return (
    <>
      {!backendActivo && (
        <div className="system-banner"><AlertTriangle size={16} /><span><strong>Servicio temporalmente no disponible</strong> Estamos intentando restablecer la conexión con el backend.</span></div>
      )}

      <Header />

      <main className="layout">
        <Sidebar />
        <section className="content">
          <Outlet />
        </section>
      </main>
    </>
  );
}
