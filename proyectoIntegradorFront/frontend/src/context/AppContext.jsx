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

  // ✅ cargar plantas
  useEffect(() => {
    axios.get(`${API}/plantas`)
      .then((res) => {
        console.log("PLANTAS BACKEND =", res.data);
        setPlantas(res.data);
      })
      .catch((err) => {
        console.error("Error cargando plantas", err);
      });
  }, []);

  // ✅ cargar paquetes del usuario
useEffect(() => {
  if (!user?.email) return;

  console.log("Buscando paquetes para:", user.email);

  axios.get(`${API}/paquetes/usuario/${user.email}`)
    .then((res) => {
      console.log("PAQUETES DEL USUARIO =", res.data);
      setPaquetes(res.data);
    })
    .catch((err) => {
      console.error("Error cargando paquetes", err);
    });

}, [user?.email]);

  // ✅ login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // ✅ logout
  const logout = () => {
    setUser(null);
    setPaquetes([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
  };

  // ✅ restaurar usuario
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
