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
  if (!user) return; 

  cargarPaquetes();
}, [user]);


  useEffect(() => {
    savePaquetes(paquetes);
  }, [paquetes]);


useEffect(() => {
  if (!user?.email) return;

  axios
    .get(`${API}/notificaciones/${user.email}`)
    .then(res => {
      setNotificaciones(res.data);
    })
    .catch(err => console.error(err));

}, [user]);


useEffect(() => {
  console.log("CHECK BACKEND RUNNING");

  const checkBackend = async () => {
    try {
      await axios.get(`${API}/test/health`);
      console.log("✅ BACKEND OK");
      setBackendActivo(true);
    } catch (err) {
      console.log("❌ BACKEND DOWN", err.message);
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
        setNotificaciones,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
