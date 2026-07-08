import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { apiGet } from "../api/apiClient";
 
export default function PaqueteDetalle() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
 
  const API = import.meta.env.VITE_API_URL;
 
  const [paquete, setPaquete] = useState(null);
  const [ultimoHistorial, setUltimoHistorial] = useState(null);
  const [historialCompleto, setHistorialCompleto] = useState([]);
 
  const cargarHistorialCompleto = async () => {
    try {
      const res = await apiGet(`${API}/paquetes/${id}/historial`);
      const data = await res.json();
      setHistorialCompleto(data);
    } catch (err) {
      console.error("Error cargando historial completo:", err);
    }
  };
 
  const cargarUltimoHistorial = async () => {
    try {
      const res = await apiGet(`${API}/paquetes/${id}/historial/ultimo`);
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
 
  const cargarPaquete = async () => {
    try {
      const res = await apiGet(`${API}/paquetes/${id}`);
      const data = await res.json();
      setPaquete(data);
    } catch (err) {
      console.error("Error cargando paquete:", err);
    }
  };
 
  useEffect(() => {
    if (!user) return;
 
    if (user.role.toLowerCase() !== "empleado") {
      navigate("/");
      return;
    }
 
    cargarPaquete();
    cargarUltimoHistorial();
    cargarHistorialCompleto();
  }, [user]);
 
  if (!paquete) return <p>Cargando...</p>;
  const historialSinUltimo = historialCompleto.filter(
  (h) => h.id !== ultimoHistorial?.id
);
 
  return (
    <section className="panel">
 
      {/* --- Detalle del paquete --- */}
      <h1>Detalle del paquete #{paquete.id}</h1>
 
      <p><b>ID:</b> {paquete.id}</p>
      <p><b>Planta:</b> {paquete.planta?.nombre}</p>
      <p><b>Fecha de captura:</b> {paquete.captureDate}</p>
      <p><b>Volumen (ton CO2eq):</b> {paquete.tonCO2eq}</p>
      <p><b>Estado:</b> {paquete.estado}</p>
      {paquete.estado === "EN_REVISION" && (
        <button
          onClick={() => navigate(`/editar/${paquete.id}`)}
          style={{
            marginTop: "15px",
            padding: "10px 15px",
            background: "#4a90e2",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ✏️ Editar paquete
        </button>
      )}
      <p><b>Creado por:</b> {paquete.createdBy}</p>
 
      {/* --- Timeline --- */}
      <h2>Historial</h2>
 
      <div className="timeline">
 
        {/* --- Último historial --- */}
        {ultimoHistorial && (
          <div className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <h3>Última modificación</h3>
 
              <p><b>Acción:</b> {ultimoHistorial.accion}</p>
              <p><b>Editor:</b> {ultimoHistorial.editor}</p>
              <p><b>Fecha:</b> {new Date(ultimoHistorial.fecha).toLocaleString()}</p>
 
              {ultimoHistorial.cambios && ultimoHistorial.cambios.length > 0 ? (
                <>
                  <h4>Cambios realizados</h4>
                  <ul>
                    {ultimoHistorial.cambios.map((cambio, index) => (
                      <li key={index} style={{ marginBottom: "8px" }}>
 
                        {cambio.campo && cambio.comentario && (
                          <>
                            <b>Campo:</b> {cambio.campo} <br />
                            <b>Comentario:</b> {cambio.comentario}
                          </>
                        )}
 
                        {cambio.campo === "estado" &&
                          cambio.valorAnterior &&
                          cambio.valorNuevo && (
                            <>
                              <b>Estado anterior:</b> {cambio.valorAnterior} <br />
                              <b>Estado actual:</b> {cambio.valorNuevo}
                            </>
                          )}
 
                        {cambio.tipo === "COMENTARIO_GENERAL" && (
                          <>
                            <b>Comentario general:</b> {cambio.texto}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>No hay cambios realizados.</p>
              )}
            </div>
          </div>
        )}
 
        {/* --- Historial completo --- */}
        {historialSinUltimo.length === 0 ? (
  <p>No hay historial registrado.</p>
) : (
  historialSinUltimo.map((h) => (
    <div key={h.id} className="timeline-item">
      <div className="timeline-marker"></div>
      <div className="timeline-content">
        <h3>Modificación</h3>
 
        <p><b>Acción:</b> {h.accion}</p>
        <p><b>Editor:</b> {h.editor}</p>
        <p><b>Fecha:</b> {new Date(h.fecha).toLocaleString()}</p>
 
        {h.cambios && h.cambios.length > 0 ? (
          <>
            <h4>Cambios realizados</h4>
            <ul>
              {h.cambios.map((cambio, index) => (
                <li key={index} style={{ marginBottom: "8px" }}>
                  {cambio.campo && cambio.comentario && (
                    <>
                      <b>Campo:</b> {cambio.campo} <br />
                      <b>Comentario:</b> {cambio.comentario}
                    </>
                  )}
 
                  {cambio.campo === "estado" &&
                    cambio.valorAnterior &&
                    cambio.valorNuevo && (
                      <>
                        <b>Estado anterior:</b> {cambio.valorAnterior} <br />
                        <b>Estado nuevo:</b> {cambio.valorNuevo}
                      </>
                    )}
 
                  {cambio.tipo === "COMENTARIO_GENERAL" && (
                    <>
                      <b>Comentario general:</b> {cambio.texto}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No hay cambios realizados.</p>
        )}
      </div>
    </div>
  ))
)}
      </div>
    </section>
  );
} 
