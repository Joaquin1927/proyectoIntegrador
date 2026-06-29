import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function PaqueteDetalle() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [paquete, setPaquete] = useState(null);
  const [ultimoHistorial, setUltimoHistorial] = useState(null);

  const cargarUltimoHistorial = async () => {
  try {
    const res = await fetch(`${API}/paquetes/${id}/historial/ultimo`);

    if (res.status === 204) {
      setUltimoHistorial(null);
      return;
    }

    const data = await res.json();
    setUltimoHistorial(data);

  } catch (err) {
    console.error("Error cargando historial:", err);
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
    cargarUltimoHistorial();
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
      {ultimoHistorial && (
        <div className="card" style={{ marginBottom: "20px", padding: "15px" }}>
          <h3>Última modificación</h3>

          <p>
            <b>Acción:</b> {ultimoHistorial.accion}
          </p>
          <p>
            <b>Realizado por:</b> {ultimoHistorial.editor}
          </p>
          <p>
            <b>Fecha:</b> {new Date(ultimoHistorial.fecha).toLocaleString()}
          </p>

          {ultimoHistorial.cambios && (
            <>
              <h4>Cambios realizados</h4>
              <pre>{JSON.stringify(ultimoHistorial.cambios, null, 2)}</pre>
            </>
          )}
        </div>
      )}
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
  <button onClick={() => navigate(`/EditarPaquete/${paquete.id}`)}>
    Editar paquete
  </button>
)}

    </section>
  );
}
