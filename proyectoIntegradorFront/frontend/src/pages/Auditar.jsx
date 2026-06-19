import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import axios from "axios";
import { useMsal } from "@azure/msal-react";

export default function Auditar() {
  const API = import.meta.env.VITE_API_URL;
  const { user } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const { instance, accounts } = useMsal();

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
        `${API}/paquetes/${id}/aprobar`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("✅ Paquete aprobado");

      // ✅ simplemente navegar
      navigate("/pendientes");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Error al aprobar");
    }
  };

  const rechazar = async () => {
    if (!comentarioGeneral.trim()) {
      alert("El comentario es obligatorio");
      return;
    }

    try {
      const response = await instance.acquireTokenSilent({
        scopes: ["api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"],
        account: accounts[0],
      });

      const token = response.accessToken;

      await axios.post(
        `${API}/paquetes/${id}/rechazar`,
        {
          comentario: comentarioGeneral, // ✅ si luego lo querés usar en backend
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("❌ Paquete rechazado");
      navigate("/pendientes");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Error al rechazar paquete");
    }
  };

  const deshacerCorreccion = () => {
    setModoCorreccion(false);
    setComentariosCampos({});
    setComentarioGeneral("");
  };

  const [loading, setLoading] = useState(false);

  const mandarCorreccion = async () => {
    if (!comentarioGeneral.trim()) {
      alert("El comentario general es obligatorio");
      return;
    }

    try {
      const response = await instance.acquireTokenSilent({
        scopes: ["api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"],
        account: accounts[0],
      });

      const token = response.accessToken;

      await axios.post(
        `${API}/paquetes/${id}/correccion`,
        {
          comentarioGeneral,
          comentariosCampos,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("🛠 Corrección solicitada");
      navigate("/pendientes");
    } catch (err) {
      console.error(err);
      alert("Error al solicitar corrección");
    }
  };

  // ✅ 1. VALIDAR ROL

  useEffect(() => {
    if (!user) return;

    if (user.role.toLowerCase() !== "auditor") {
      alert("acceso exclusivo para auditores");
      navigate("/dashboard");
    }
  }, [user]);

  // ✅ bloquear render
  if (!user) return <p>Cargando...</p>;

  if (user.role.toLowerCase() !== "auditor") {
    return null;
  }

  useEffect(() => {
    console.log("Buscando paquete ID:", id);

    axios
      .get(`${API}/paquetes/${id}`)
      .then((res) => {
        console.log("PAQUETE:", res.data);
        setPaquete(res.data);
      })
      .catch((err) => {
        console.error("Error cargando paquete", err);
      });
  }, [id]);

  if (!paquete) return <p>Cargando...</p>;

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
          <div key={key} style={{ marginBottom: "10px" }}>
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
