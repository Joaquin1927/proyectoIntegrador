export default function PaqueteModal({ paquete, onClose, onAceptar, loading }) {
  if (!paquete) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Detalle del paquete</h2>

        <p><b>ID:</b> {paquete.id}</p>
        <p><b>Planta:</b> {paquete.planta?.nombre}</p>
        <p><b>Fecha:</b> {paquete.captureDate}</p>
        <p><b>Volumen:</b> {paquete.tonCO2eq}</p>
        <p><b>Estado:</b> {paquete.estado}</p>

        <div className="modal-actions">
          {onAceptar && (
            <button onClick={onAceptar} disabled={loading}>
              {loading ? "Procesando..." : "✅ Aceptar"}
            </button>
          )}

          <button onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}