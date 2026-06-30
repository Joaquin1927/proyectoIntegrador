import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
 
export default function PaqueteDetalle() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
 
  const API = import.meta.env.VITE_API_URL;
 
  const [paquete, setPaquete] = useState(null);
  const [historial, setHistorial] = useState([]);
 
  
const cargarHistorial = async () => {

  try {

    const res = await fetch(
      `${API}/historial/${id}/getHistorial`
    );

    const data = await res.json();

    setHistorial(data);

  } catch (err) {
    console.error(err);
  }
};

 
 
  useEffect(() => {
    if (!user) return;
 
    // Solo empleados pueden ver esta página
    if (user.role.toLowerCase() !== "empleado") {
      navigate("/");
      return;
    }
 
    cargarPaquete();
    cargarHistorial();
  }, [user]);
 
  const cargarPaquete = async () => {
    try {
      const res = await fetch(`${API}/paquetes/${id}`);
      const data = await res.json();
      setPaquete(data);
    } catch (err) {
      console.error("Error cargando paquete:", err);
    }
  };
 
  if (!paquete) return <p>Cargando...</p>;
 
  return (
    <section className="panel">
      
<h2>Historial</h2>

{historial.map(h => (

  <div key={h.id} className="card">

    <p>
      <b>Acción:</b> {h.accion}
    </p>

    <p>
      <b>Editor:</b> {h.editor}
    </p>

    <p>
      <b>Fecha:</b>{" "}
      {new Date(h.fecha).toLocaleString()}
    </p>

    {h.cambios && (
      <pre>
        {JSON.stringify(h.cambios, null, 2)}
      </pre>
    )}

  </div>
))}

      <h1>Detalle del paquete #{paquete.id}</h1>
 
      <p>
        <b>ID:</b> {paquete.id}
      </p>
      <p>
        <b>Planta:</b> {paquete.planta?.nombre}
      </p>
      <p>
        <b>Fecha de captura:</b> {paquete.captureDate}
      </p>
      <p>
        <b>Volumen (ton CO2eq):</b> {paquete.tonCO2eq}
      </p>
      <p>
        <b>Estado:</b> {paquete.estado}
      </p>
      <p>
        <b>Creado por:</b> {paquete.createdBy}
      </p>
 
      {paquete.metadata && (
        <>
          <h3>Metadata</h3>
          <pre>{JSON.stringify(paquete.metadata, null, 2)}</pre>
        </>
      )}
     
      <button onClick={() => navigate(-1)}>Volver</button>
     
{paquete.estado === "EN_REVISION" && (
  <button onClick={() => navigate(`/editar/${paquete.id}`)}>
    Editar paquete
  </button>
)}
 
    </section>
  );
}