import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { authFetch } from "../api/authFetch";
import { useMsal } from "@azure/msal-react";
export default function EditarPaquete() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
  const { instance, accounts } = useMsal();

  const API = import.meta.env.VITE_API_URL;

  const [data, setData] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [cambios, setCambios] = useState({});
  const [camposError, setCamposError] = useState({});

  useEffect(() => {
    if (!user) return;

    cargar();
  }, [user]);

  
const cargar = async () => {

  try {

    const response = await instance.acquireTokenSilent({
      scopes: [
        "api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"
      ],
      account: accounts[0],
    });

    const token = response.accessToken;

    const res = await authFetch(
      `${API}/paquetes/${id}/edicion`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();

    setData(json);
    setMetadata(json.metadata || {});

    const errores = Object.fromEntries(
      (json.camposConError || [])
        .map(c => [c.campo, c.comentario])
    );

    setCamposError(errores);

  } catch (err) {
    console.error("Error cargando paquete:", err);
  }
};


  const handleChange = (key, value) => {
    setMetadata(prev => ({
      ...prev,
      [key]: value
    }));

    setCambios(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const guardar = async () => {

  if (Object.keys(cambios).length === 0) {
    alert("Debes modificar al menos un campo");
    return;
  }

  try {

    const response = await instance.acquireTokenSilent({
      scopes: [
        "api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"
      ],
      account: accounts[0],
    });

    const token = response.accessToken;

    const res = await authFetch(
      `${API}/paquetes/${id}/corregir`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          metadata,
          comentarioGeneral: ""
        })
      }
    );

    if (!res.ok) {
      throw new Error("Error en backend");
    }

    alert("Corrección enviada ✅");

    navigate("/historial");

  } catch (err) {

    console.error("Error guardando:", err);

    alert("Error al guardar");
  }
};

  if (!data) return <p>Cargando...</p>;

  return (
    <section className="panel">
      <h1>Editar paquete #{data.id}</h1>

      <p><strong>Estado:</strong> {data.estado}</p>

      <h3>Comentario del auditor</h3>
      <p style={{ background: "#f5f5f5",color:"#060606", padding: "10px" }}>
        {data.comentarioGeneral || "Sin comentario"}
      </p>

      <h3>Campos</h3>

      {Object.entries(metadata).map(([key, value]) => {

        const tieneError = camposError[key];
        const fueModificado = cambios[key] !== undefined;

        return (
          <div key={key} style={{ marginBottom: "15px" }}>
            <label><strong>{key}</strong></label>

            <input
              value={value ?? ""}
              onChange={(e) => handleChange(key, e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "5px",
                border:
                  tieneError
                    ? (fueModificado
                        ? "2px solid green"
                        : "2px solid red")
                    : "1px solid gray"
              }}
            />

            {tieneError && !fueModificado && (
              <p style={{ color: "red", marginTop: "5px" }}>
                ⚠ {camposError[key]}
              </p>
            )}

            {tieneError && fueModificado && (
              <p style={{ color: "green", marginTop: "5px" }}>
                ✅ Campo corregido
              </p>
            )}
          </div>
        );
      })}

      <button onClick={guardar}>💾 Guardar corrección</button>
      <button onClick={() => navigate(-1)}>⬅ Volver</button>

    </section>
  );
}
