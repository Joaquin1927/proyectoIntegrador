import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";

import App from "./App";
import { msalInstance } from "./auth/msalConfig";
import { AppProvider } from "./context/AppProvider";
import { ToasterProvider } from "./ui/Toaster";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <AppProvider>
        <ToasterProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToasterProvider>
      </AppProvider>
    </MsalProvider>
  </React.StrictMode>
);
