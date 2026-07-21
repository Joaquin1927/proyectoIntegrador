import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import axios from "axios";
import { useMsal } from "@azure/msal-react";
import { useToast } from "../ui/Toaster";
import { LoadingState } from "../ui/Feedback";

export default function Auditar() {
  const API = import.meta.env.VITE_API_URL;
  const { user } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const { instance, accounts } = useMsal();
  const toast = useToast();

  const [modoCorreccion, setModoCorreccion] = useState(false);
  const [comentarioGeneral, setComentarioGeneral] = useState("");
  const [comentariosCampos, setComentariosCampos] = useState({});
  const [modoRechazo, setModoRechazo] = useState(false);

  const [paquete, setPaquete] = useState(null);

  const aprobar = async () => {
    try {
      const response = await instance.acquireTokenSilent({
        scopes: ["api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"],
        account: accounts[0],
      });

      const token = response.accessToken;

      await axios.post(
        `${API}/auditoria/${id}/aprobar`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Paquete aprobado correctamente");

      // ✅ simplemente navegar
      navigate("/pendientes");
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Error al aprobar el paquete");
    }
  };

  const rechazar = async () => {
    if (!comentarioGeneral.trim()) {
      toast.error("El comentario es obligatorio");
      return;
    }

    try {
      const response = await instance.acquireTokenSilent({
        scopes: ["api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"],
        account: accounts[0],
      });

      const token = response.accessToken;

      await axios.post(
        `${API}/auditoria/${id}/rechazar`,
        {
          comentario: comentarioGeneral, 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Paquete rechazado y notificado");
      navigate("/pendientes");
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Error al rechazar el paquete");
    }
  };

  const deshacerCorreccion = () => {
    setModoCorreccion(false);
    setComentariosCampos({});
    setComentarioGeneral("");
  };

  const [loading, setLoading] = useState(false);

  const mandarCorreccion = async () => {
    const campos = Object.entries(comentariosCampos)
      .filter(([_, comentario]) => comentario && comentario.trim() !== "")
      .map(([campo, comentario]) => ({
        campo,
        comentario,
      }));

    const body = {
      campos,
      comentarioGeneral,
    };

    if (campos.length === 0) {
      toast.error("Debés marcar al menos un campo");
      return;
    }

    if (!comentarioGeneral.trim()) {
      toast.error("Ingresá un comentario general");
      return;
    }
    console.log("BODY QUE ENVIO:", body);
    try {
      
  
const response = await instance.acquireTokenSilent({
  scopes: ["api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"],
  account: accounts[0],
});
    
const token = response.accessToken;

await axios.post(
  `${API}/auditoria/${id}/correccion`,
  body,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


      navigate(-1);
    } catch (err) {
      console.error("Error enviando corrección:", err);
    }
  };


  useEffect(() => {
    if (!user) return;

    if (user.role.toLowerCase() !== "auditor") {
      toast.error("Esta sección es exclusiva para auditores");
      navigate("/dashboard");
    }
  }, [user]);

  if (!user) return <LoadingState title="Preparando auditoría" text="Validando tu sesión…" />;

  if (user.role.toLowerCase() !== "auditor") {
    return null;
  }
const [error, setError] = useState(null);
useEffect(() => {
const cargarPaquete = async () => {
try {
const response = await instance.acquireTokenSilent({
scopes: [
"api://36920833-e50a-48be-b51a-e363b373c011/access_as_user",
],
account: accounts[0],
});
 
const token = response.accessToken;
 
const res = await axios.get(`${API}/paquetes/${id}`, {
headers: {
Authorization: `Bearer ${token}`,
},
});
 
setPaquete(res.data);
setError(null);
} catch (err) {
console.error("Error cargando paquete:", err);
 
if (err.response?.status === 401) {
setError("Tu sesión expiró. Volvé a iniciar sesión.");
} else if (err.response?.status === 403) {
setError(
"No tenés permisos para acceder a este paquete. Se requiere perfil de auditor."
);
} else {
setError(
err.response?.data?.message ||
"Ocurrió un error al cargar el paquete."
);
}
}
};if (accounts.length > 0) {
cargarPaquete();
}
}, [id, accounts]);

if (error) {
return (
<div className="panel">
<h3>Error</h3>
<p>{error}</p>
<button onClick={() => navigate("/dashboard")}>
Volver
</button>
</div>
);
}

  if (!paquete) return <LoadingState title="Cargando paquete" text="Recuperando metadata y evidencia…" />;

  const metadata = paquete?.metadata ? JSON.parse(paquete.metadata) : {};
  const volumen = paquete.tonCO2eq ?? metadata.tonCO2eq;

  return (
    <div className="panel">
      <h2>Auditar paquete {paquete.id}</h2>

      <p>
        <strong>Planta:</strong> {paquete.planta.nombre}
      </p>
      <p>
        <strong>CO₂:</strong> {volumen}
      </p>

      <h3>Datos adicionales</h3>

      {Object.entries(metadata)
        .filter(([key]) => key !== "_tonCO2eq" && key !== "facilityName")
        .map(([key, val]) => (
          <div
            key={key}
            style={{
              border: comentariosCampos[key] ? "2px solid red" : "none",
              padding: "5px",
            }}
          >
            <p>
              <strong>{key}:</strong> {val}
            </p>

            {modoCorreccion && (
              <>
                <button
                  onClick={() =>
                    setComentariosCampos((prev) => ({
                      ...prev,
                      [key]: "",
                    }))
                  }
                >
                  Marcar problema
                </button>

                {comentariosCampos[key] !== undefined && (
                  <input
                    type="text"
                    placeholder="Explicar problema en este campo"
                    value={comentariosCampos[key]}
                    onChange={(e) =>
                      setComentariosCampos((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                )}
              </>
            )}
          </div>
        ))}

      {!modoCorreccion && (
        <>
          <button onClick={aprobar} disabled={loading}>
            ✅ Aprobar
          </button>
          <button
            onClick={() => {
              setModoCorreccion(true);
              setModoRechazo(false);
            }}
          >
            🛠 Solicitar correcciones
          </button>

          <button
            onClick={() => {
              setModoRechazo(true);
              setModoCorreccion(false);
            }}
          >
            ❌ Rechazar
          </button>
        </>
      )}

      {modoCorreccion && (
        <>
          <h3>Detalle de correcciones</h3>

          <textarea
            placeholder="Comentario general (obligatorio)"
            value={comentarioGeneral}
            onChange={(e) => setComentarioGeneral(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: "10px" }}
          />

          <button onClick={mandarCorreccion}>📩 Mandar a revisión</button>

          <button onClick={deshacerCorreccion}>↩ Deshacer</button>
        </>
      )}

      {modoRechazo && (
        <>
          <h3>Motivo de rechazo</h3>

          <textarea
            placeholder="Comentario general (obligatorio)"
            value={comentarioGeneral}
            onChange={(e) => setComentarioGeneral(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: "10px" }}
          />

          <button onClick={rechazar}>❌ Confirmar rechazo</button>

          <button onClick={() => setModoRechazo(false)}>↩ Cancelar</button>
        </>
      )}

      <button onClick={() => navigate("/dashboard")}>Volver</button>
    </div>
  );
}
