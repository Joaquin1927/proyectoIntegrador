import { useEffect, useState, createContext, useContext } from "react";

const ToastCtx = createContext(null);

export function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (type, text) => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, type, text }]);
    // autodestruir
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  const api = {
    success: (t) => push("success", t),
    error: (t) => push("error", t),
    info: (t) => push("info", t),
  };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div style={wrap}>
        {toasts.map(t => (
          <div key={t.id} style={{...toast, ...(t.type==="error"?err: t.type==="success"?ok:info)}}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

const wrap = {
  position: "fixed", right: 16, top: 16, display: "flex", flexDirection: "column", gap: 8, zIndex: 9999
};
const toast = {
  padding: "10px 12px", borderRadius: 10, boxShadow:"0 6px 16px rgba(0,0,0,.35)",
  fontWeight: 600, fontSize: 14, border: "1px solid #333", maxWidth: 360
};
const err = { background: "#2b1a1a", color:"#ffb3b3", borderColor:"#5a2626" };
const ok  = { background: "#1f2a1f", color:"#c0ffc0", borderColor:"#2f5130" };
const info= { background: "#1f2633", color:"#c8e1ff", borderColor:"#2b3b55" };