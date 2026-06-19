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
  const [backendOk, setBackendOk] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/plantas`)
      .then((res) => setPlantas(res.data))
      .catch((err) => console.error("Error cargando plantas", err));
  }, [API]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
    cargarPaquetes();
  }, [cargarPaquetes]);

  useEffect(() => {
    savePaquetes(paquetes);
  }, [paquetes]);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API}/test`);
        if (!res.ok) throw new Error();
        setBackendOk(true);
      } catch {
        setBackendOk(false);
      }
    };

    checkBackend();
  }, [API]);

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
        backendOk,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
