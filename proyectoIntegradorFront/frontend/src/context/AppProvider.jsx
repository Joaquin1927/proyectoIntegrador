import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "./AppContext";

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

  // Cargar plantas
  useEffect(() => {
    axios
      .get(`${API}/plantas`)
      .then((res) => setPlantas(res.data))
      .catch((err) => console.error("Error cargando plantas", err));
  }, [API]);

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
  }, [user]);

  useEffect(() => {
    savePaquetes(paquetes);
  }, [paquetes]);

  const reloadNotificaciones = async () => {
    if (!user?.email) return;

    try {
      const res = await axios.get(`${API}/notificaciones/noleidas/${user.email}`);
      console.log("NOTIFICACIONES:", res.data);
      setNotificaciones(res.data);
    } catch (err) {
      console.error("Error recargando notificaciones", err);
    }
  };

  // Cargar notificaciones al iniciar
  useEffect(() => {
    reloadNotificaciones();
  }, [user]);

  // Backend health check
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get(`${API}/test/health`);
        setBackendActivo(true);
      } catch (err) {
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
        reloadNotificaciones,   // 👈 CLAVE
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
