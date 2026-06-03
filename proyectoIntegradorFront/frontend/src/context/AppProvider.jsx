import { useState, useEffect } from "react";
import { AppContext } from "./AppContext";

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

function savePaquetes(paquetes) {
  localStorage.setItem(DB_KEY, JSON.stringify(paquetes));
}

export function AppProvider({ children }) {
const plantas = [
  { id: 1, nombre: "Planta Norte" }
];

  const [paquetes, setPaquetes] = useState(() => loadPaquetes());
  const [user, setUser] = useState(null);

  useEffect(() => {
    savePaquetes(paquetes);
  }, [paquetes]);

  // ✅ helpers
  const login = (userData) => setUser(userData);
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}