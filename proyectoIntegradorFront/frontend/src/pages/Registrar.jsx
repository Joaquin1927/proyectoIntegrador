import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import TablePaquetes from "../components/TablePaquetes";

export default function Registrar() {
  const { plantas, paquetes, setPaquetes, user } = useApp();

  useEffect(() => {
    if (!user) {
      window.location.hash = "#login";
    }
  }, [user]);

  if (!user) return null;

  const submit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    const nuevo = {
      id: crypto.randomUUID(),
      plantaId: data.plantaId,
      plantaNombre: plantas.find(p => p.id === data.plantaId)?.nombre,
      fecha: data.fecha,
      hora: data.hora,
      volumenTon: parseFloat(data.volumenTon),
      pureza: parseFloat(data.pureza),
      metodo: data.metodo,
      empleadoId: user.id,
      estado: "pendiente",
    };

    setPaquetes([nuevo, ...paquetes]);
    e.target.reset();
  };

  return (
    <section className="panel">
      <h1>Registrar paquete de captura de CO₂</h1>

      <form className="grid three" onSubmit={submit}>
        <div className="field">
          <label>Planta</label>
          <select name="plantaId" required>
            {plantas.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Fecha</label>
          <input type="date" name="fecha" required />
        </div>

        <div className="field">
          <label>Hora</label>
          <input type="time" name="hora" required />
        </div>

        <div className="field">
          <label>Volumen capturado (ton)</label>
          <input type="number" step="0.001" min="0.001" name="volumenTon" required />
        </div>

        <div className="field">
          <label>Pureza CO₂ (%)</label>
          <input type="number" step="0.1" min="0" max="100" name="pureza" required />
        </div>

        <div className="field">
          <label>Método</label>
          <select name="metodo">
            <option>Post-combustión</option>
            <option>Pre-combustión</option>
            <option>DAC</option>
            <option>Oxy-fuel</option>
          </select>
        </div>

        <div className="actions span-3">
          <button className="primary">Guardar paquete</button>
        </div>
      </form>

      <div className="panel sub">
        <h2>Últimos paquetes cargados por vos</h2>
        <TablePaquetes
          items={paquetes.filter(p => p.empleadoId === user.id)}
        />
      </div>
    </section>
  );
}