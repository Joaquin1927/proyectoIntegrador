import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);

  const plantas = [
    { id: "PL-001", nombre: "Planta Norte" },
    { id: "PL-002", nombre: "Planta Delta" },
    { id: "PL-003", nombre: "Planta Sur" },
  ];

  const [paquetes, setPaquetes] = useState([]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        plantas,
        paquetes,
        setPaquetes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
``