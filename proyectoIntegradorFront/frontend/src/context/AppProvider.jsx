import { useCallback, useEffect, useState } from "react";
import axios from "../api/axios";
import { AppContext } from "./AppContext";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("REQUEST:", config.url);
  console.log("TOKEN ENVIADO:", !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
import { apiGet } from "../api/apiClient";

const DB_KEY = "co2x_db_v1";

function savePaquetes(paquetes) {
  localStorage.setItem(DB_KEY, JSON.stringify(paquetes));
}

export function AppProvider({ children }) {
  const API = import.meta.env.VITE_API_URL;

  const [plantas, setPlantas] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [user, setUser] = useState(null);
  const [backendActivo, setBackendActivo] = useState(true);
  const [notificaciones, setNotificaciones] = useState([]);

  // Restaurar usuario
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Cargar paquetes
  const cargarPaquetes = useCallback(async () => {
    if (!user?.email) {
      setPaquetes([]);
      return;
    }

    try {
      const endpoint =
        user.role === "auditor"
          ? `${API}/paquetes`
          : `${API}/paquetes/usuario/${user.email}`;

      const res = await axios.get(endpoint);
      setPaquetes(res.data);
    } catch (err) {
      console.error("Error cargando paquetes", err);
    }
  }, [API, user?.email, user?.role]);

  useEffect(() => {
    if (!user) return;
    cargarPaquetes();
    cargarPlantas();
  }, [user]);

  useEffect(() => {
    savePaquetes(paquetes);
  }, [paquetes]);
  const cargarPlantas = async () => {
  try {
    const res = await axios.get(`${API}/plantas`);

    console.log("PLANTAS:", res.data);

    setPlantas(res.data);
  } catch (err) {
    console.error("ERROR CARGANDO PLANTAS", err);
  }
};
  const reloadNotificaciones = async () => {
    if (!user?.email) return;

    try {
      const res = await axios.get(
        `${API}/notificaciones/noleidas/${user.email}`,
      );
      console.log("NOTIFICACIONES:", res.data);
      setNotificaciones(res.data);
    } catch (err) {
      console.error("Error recargando notificaciones", err);
    }
  };

  useEffect(() => {
    reloadNotificaciones();
  }, [user]);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await apiGet(`${API}/test/health`, false);

        setBackendActivo(true);
      } catch {
        setBackendActivo(false);
      }
    };

    checkBackend();

    const interval = setInterval(checkBackend, 5000);

    return () => clearInterval(interval);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setPaquetes([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        plantas,
        paquetes,
        setPaquetes,
        user,
        setUser,
        login,
        logout,
        cargarPaquetes,
        backendActivo,
        notificaciones,
        reloadNotificaciones, // 👈 CLAVE
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
