import { useState, createContext, useContext } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastCtx = createContext(null);

export function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (type, text) => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, type, text }]);
    // autodestruir
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  const dismiss = (id) => setToasts((current) => current.filter((item) => item.id !== id));
  const api = {
    success: (t) => push("success", t),
    error: (t) => push("error", t),
    info: (t) => push("info", t),
  };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`app-toast app-toast--${t.type}`}>
            {t.type === "error" ? <AlertCircle /> : t.type === "success" ? <CheckCircle2 /> : <Info />}
            <div><strong>{t.type === "error" ? "No se pudo completar" : t.type === "success" ? "Operación completada" : "Información"}</strong><span>{t.text}</span></div>
            <button onClick={() => dismiss(t.id)} aria-label="Cerrar notificación"><X size={15} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastCtx);
