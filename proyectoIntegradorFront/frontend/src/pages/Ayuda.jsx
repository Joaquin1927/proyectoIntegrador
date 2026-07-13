import { useApp } from "../context/AppContext";

const guides = {
  empleado: [
    ["Registrar una captura", "Ve a Registrar, carga un CSV/JSON, selecciona la planta y revisa los datos antes de enviar."],
    ["Corregir observaciones", "Abre el paquete desde Consulta de paquetes. Si está En revisión, modifica los campos señalados y reenvíalo."],
    ["Seguir el estado", "Consulta el historial para ver cada transición, comentario del auditor y estado actual."],
  ],
  auditor: [
    ["Revisar pendientes", "Abre Pendientes y entra al detalle. Compara metadata, planta, volumen y fecha."],
    ["Aprobar", "La aprobación genera el recibo, sube la metadata a IPFS y registra el CID."],
    ["Rechazar o corregir", "Un rechazo requiere comentario técnico. Para correcciones, marca campos y agrega una explicación general."],
  ],
  admin: [
    ["Mintear certificados", "En Mintear Tokens selecciona un paquete aprobado. Espera el hash y verifica la transacción en PolygonScan."],
    ["Evitar duplicados", "Si un hash blockchain ya está registrado, el sistema no vuelve a emitir los tokens."],
    ["Consultar trazabilidad", "Usa Consulta de paquetes y exporta el resultado filtrado a CSV."],
  ],
};

export default function Ayuda() {
  const { user } = useApp();
  const role = user?.role || "empleado";

  return (
    <section className="panel help-page">
      <div className="help-hero">
        <span className="mint-eyebrow">CENTRO DE AYUDA CO2X</span>
        <h1>¿Cómo podemos ayudarte?</h1>
        <p>Guía rápida para operar el flujo dMRV de forma segura y trazable.</p>
      </div>

      <div className="help-grid">
        {(guides[role] || guides.empleado).map(([title, body], index) => (
          <article className="help-card" key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>

      <div className="help-flow">
        <h2>Flujo de un paquete</h2>
        <div><span>Registro</span><b>→</b><span>Auditoría</span><b>→</b><span>IPFS</span><b>→</b><span>Mint</span></div>
      </div>

      <div className="help-notes">
        <h2>Estados principales</h2>
        <p><strong>Pendiente:</strong> espera revisión del auditor.</p>
        <p><strong>En revisión:</strong> el empleado debe corregir observaciones.</p>
        <p><strong>Aprobado:</strong> cuenta con recibo y CID; está listo para mint.</p>
        <p><strong>Minteado:</strong> la transacción blockchain fue enviada y su hash quedó registrado.</p>
      </div>
    </section>
  );
}
