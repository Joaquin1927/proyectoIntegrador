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
    { id: "PL-001", nombre: "Planta Norte" },
    { id: "PL-002", nombre: "Planta Delta" },
    { id: "PL-003", nombre: "Planta Sur" },
  ];

  const [paquetes, setPaquetes] = useState(() => loadPaquetes());
  const [user, setUser] = useState(null);

  useEffect(() => {
    savePaquetes(paquetes);
  }, [paquetes]);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AppContext.Provider
      value={{
        plantas,
        paquetes,
        setPaquetes,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
