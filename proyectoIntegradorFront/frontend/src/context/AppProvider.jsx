import { useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import axios from "axios";
import { createContext } from "react";


const DB_KEY = "co2x_db_v1";

function loadPaquetes() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
//console.log("APP PROVIDER USER =", user);
//console.log("APP PROVIDER PAQUETES =", paquetes);
function savePaquetes(paquetes) {
  localStorage.setItem(DB_KEY, JSON.stringify(paquetes));
}


export function AppProvider({ children }) {

  const API = import.meta.env.VITE_API_URL;

  // ✅ ESTADOS
  const [plantas, setPlantas] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [user, setUser] = useState(null);
  const [backendOk, setBackendOk] = useState(true);

  // ✅ plantas
  useEffect(() => {
    axios.get(`${API}/plantas`)
      .then(res => setPlantas(res.data));
  }, []);

  // ✅ restaurar user
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      console.log("RESTAURANDO:", parsed);
      setUser({ ...parsed });
    }
  }, []);

  // ✅ paquetes
  useEffect(() => {
    if (!user?.email) return;

    console.log("🚀 FETCH:", user.email);

    axios.get(`${API}/paquetes/usuario/${user.email}`)
      .then(res => {
        console.log("✅ PAQUETES:", res.data);
        setPaquetes(res.data);
      });
  }, [user?.email]);

  // ✅ guardar paquetes
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
}, []);



  // ✅ helpers
  const login = (userData) => setUser(userData);
  const logout = () => {
  setUser(null);

  localStorage.removeItem("token");

  sessionStorage.clear();
};
console.log("APP PROVIDER PAQUETES =", paquetes);
  return (
    <AppContext.Provider
      value={{
        plantas,
        paquetes,
        setPaquetes,

        // ✅ USER STATE
        user,
        setUser,   // 🔥 IMPORTANTE (esto faltaba)

        // ✅ helpers opcionales
        login,
        logout,
        backendOk,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}