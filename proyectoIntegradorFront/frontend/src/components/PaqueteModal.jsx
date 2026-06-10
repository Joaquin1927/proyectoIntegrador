
const metadata = paquete?.metadata
  ? JSON.parse(paquete.metadata)
  : {};


export default function PaqueteModal({ paquete, onClose, onAceptar, onRechazar, loading }) {

  if (!paquete) return null;

  const metadata = paquete?.metadata
    ? JSON.parse(paquete.metadata)
    : {};

  return (
    <div className="modal">
      <h2>Detalle paquete {paquete.id}</h2>

      <p>Planta: {paquete.plantaId}</p>
      <p>CO₂: {paquete.tonCO2eq}</p>

      <h3>Datos adicionales</h3>

      {Object.entries(metadata).map(([key, val]) => (
        <p key={key}>
          <strong>{key}:</strong> {val}
        </p>
      ))}

      <button onClick={onAceptar} disabled={loading}>
        ✅ Aprobar
      </button>

      <button onClick={onRechazar} disabled={loading}>
        ❌ Rechazar
      </button>

      <button onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
}
