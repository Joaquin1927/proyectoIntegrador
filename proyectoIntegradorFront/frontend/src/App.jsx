import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Registrar from "./pages/Registrar";
import Pendientes from "./pages/Pendientes";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [hash, setHash] = useState(window.location.hash || "#login");

  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash || "#login");
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  let Page = Login;

  if (hash === "#login") Page = Login;
  if (hash === "#registrar") Page = Registrar;
  if (hash === "#dashboard") Page = Dashboard;
  if (hash === "#pendientes") Page = Pendientes;

  return (
    <Layout>
      <Page />
    </Layout>
  );
}