import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";

import App from "./App";
import { msalInstance } from "./auth/msalConfig";
import { AppProvider } from "./context/AppProvider";
import "./styles.css";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ MSAL manejado globalmente */}
    <MsalProvider instance={msalInstance}>
      
      {/* ✅ Contexto global de app */}
      <AppProvider>
        
        {/* ✅ Router */}
        <BrowserRouter>
          <App />
        </BrowserRouter>

      </AppProvider>

    </MsalProvider>
  </React.StrictMode>
);
