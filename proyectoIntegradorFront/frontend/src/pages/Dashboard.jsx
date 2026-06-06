import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";

export default function Dashboard() {
  const { paquetes, user } = useApp();
  const canvasRef = useRef(null);

  // ✅ mientras no hay user → mostrar cargando
  if (!user) {
    console.log(paquetes);
    return (
      <section className="panel">
        <h1>Dashboard</h1>
        <p>Cargando usuario...</p>
      </section>
    );
  }

  // ✅ lógica normal
  const aprobados = paquetes.filter(p => p.estado === "aprobado");
  const pendientes = paquetes.filter(p => p.estado === "pendiente");
  const enRevision = paquetes.filter(p => p.estado === "en_revision");
  const rechazados = paquetes.filter(p => p.estado === "rechazado");

  const totalTon = aprobados.reduce(
    (acc, p) => acc + (p.tonCO2eq || 0),
    0
  );

  const estados = [
    { key: "pendiente", label: "pendiente", value: pendientes.length },
    { key: "en_revision", label: "en_revision", value: enRevision.length },
    { key: "aprobado", label: "aprobado", value: aprobados.length },
    { key: "rechazado", label: "rechazado", value: rechazados.length },
  ];

  const max = Math.max(1, ...estados.map(e => e.value));

  // ✅ gráfico
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    const W = c.width = c.clientWidth;
    const H = c.height = 160;

    ctx.clearRect(0, 0, W, H);

    const days = Array.from({ length: 7 }).map((_, k) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - k));
      const key = d.toISOString().slice(0, 10);

      const val = paquetes
        .filter(p => p.captureDate === key && p.estado === "aprobado")
        .reduce((a, b) => a + (b.tonCO2eq || 0), 0);

      return { key, val };
    });

    const maxVal = Math.max(1, ...days.map(d => d.val));

    ctx.strokeStyle = "#2bd48d";
    ctx.beginPath();

    days.forEach((d, i) => {
      const x = 30 + i * ((W - 50) / 6);
      const y = (H - 20) - (d.val / maxVal) * (H - 40);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [paquetes]);
console.log(paquetes);
  return (
    <section className="panel">
      <h1>Dashboard</h1>

      <div className="grid three">
        <div className="kpi">
          <div className="kpi-title">Toneladas capturadas</div>
          <div className="kpi-value">{totalTon.toFixed(3)}</div>
        </div>

        <div className="kpi">
          <div className="kpi-title">Paquetes totales</div>
          <div className="kpi-value">{paquetes.length}</div>
        </div>

        <div className="kpi">
          <div className="kpi-title">Aprobados</div>
          <div className="kpi-value">{aprobados.length}</div>
        </div>
      </div>

      <div className="panel sub">
        <h2>Distribución por estado</h2>
        <div className="bars">
          {estados.map(e => {
            const h = Math.round((e.value / max) * 100);
            return (
              <div key={e.key} className="bar" style={{ height: `${h}%` }}>
                <div className="value">{e.value}</div>
                <div className="label">{e.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel sub">
        <h2>Evolución últimos 7 días</h2>
        <canvas ref={canvasRef} />
      </div>
    </section>
  );
}
