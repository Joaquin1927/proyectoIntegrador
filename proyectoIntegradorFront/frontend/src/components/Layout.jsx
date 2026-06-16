
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function Layout() {
  const { backendOk } = useContext(AppContext);

  return (
    <>
      {!backendOk && (
        <div style={{
          background: "red",
          color: "white",
          padding: "10px",
          textAlign: "center"
        }}>
          ⚠️ Atención: sistema no disponible
        </div>
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
