import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ✅ crear contexto
export const AppContext = createContext();

// ✅ hook personalizado
export function useApp() {
  return useContext(AppContext);
}

// ✅ provider
export function AppProvider({ children }) {

  const API = import.meta.env.VITE_API_URL;

  const [plantas, setPlantas] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${API}/plantas`)
      .then((res) => {
        setPlantas(res.data);
      })
      .catch((err) => {
        console.error("Error cargando plantas", err);
      });
  }, []);

  const cargarPaquetes = async () => {
    if (!user?.email) return;

    try {
      let res;

      if (user.role === "auditor") {
        res = await axios.get(`${API}/paquetes`);
      } else {
        res = await axios.get(`${API}/paquetes/usuario/${user.email}`);
      }

      console.log("PAQUETES CARGADOS:", res.data);
      setPaquetes(res.data);

    } catch (err) {
      console.error("Error cargando paquetes", err);
    }
  };

  useEffect(() => {
    cargarPaquetes();
  }, [user?.email]);

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

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
        cargarPaquetes, // ✅ 👈 ESTO ES CLAVE
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
