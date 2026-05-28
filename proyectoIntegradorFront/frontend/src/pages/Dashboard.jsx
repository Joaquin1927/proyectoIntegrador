import { useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { useApp } from "../context/AppContext";

export default function Dashboard() {
const { paquetes } = useApp();

const { accounts } = useMsal();

const user = accounts[0];
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
    }
  }, [user]);

  if (!user) return null;

  const aprobados = paquetes.filter(p => p.estado === "aprobado");
  const pendientes = paquetes.filter(p => p.estado === "pendiente");
  const enRevision = paquetes.filter(p => p.estado === "en_revision");
  const rechazados = paquetes.filter(p => p.estado === "rechazado");

  const totalTon = aprobados.reduce(
    (acc, p) => acc + (p.volumenTon || 0),
    0
  );

  // ===== Barras por estado =====
  const estados = [
    { key: "pendiente", label: "pendiente", value: pendientes.length },
    { key: "en_revision", label: "en_revision", value: enRevision.length },
    { key: "aprobado", label: "aprobado", value: aprobados.length },
    { key: "rechazado", label: "rechazado", value: rechazados.length },
  ];

  const max = Math.max(1, ...estados.map(e => e.value));

  // ===== Gráfico últimos 7 días (canvas) =====
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    const W = c.width = c.clientWidth;
    const H = c.height = 160;

    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = "#32413a";
    ctx.beginPath();
    ctx.moveTo(30, 10);
    ctx.lineTo(30, H - 20);
    ctx.lineTo(W - 10, H - 20);
    ctx.stroke();

    const days = Array.from({ length: 7 }).map((_, k) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - k));
      const key = d.toISOString().slice(0, 10);

      const val = paquetes
        .filter(p => p.fecha === key && p.estado === "aprobado")
        .reduce((a, b) => a + b.volumenTon, 0);

      return { key, val };
    });

    const maxVal = Math.max(1, ...days.map(d => d.val));

    ctx.strokeStyle = "#2bd48d";
    ctx.fillStyle = "#8ad9ff";
    ctx.beginPath();

    days.forEach((d, i) => {
      const x = 30 + i * ((W - 50) / 6);
      const y = (H - 20) - (d.val / maxVal) * (H - 40);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      ctx.fillRect(x - 2, y - 2, 4, 4);
    });

    ctx.stroke();

    ctx.fillStyle = "#a4b0aa";
    ctx.font = "10px sans-serif";
    days.forEach((d, i) => {
      const x = 30 + i * ((W - 50) / 6);
      ctx.fillText(d.key.slice(5), x - 12, H - 6);
    });
  }, [paquetes]);

  return (
    <section className="panel">
      <h1>Dashboard</h1>

      {/* KPIs */}
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

      {/* Barras */}
      <div className="panel sub">
        <h2>Distribución por estado</h2>
        <div className="bars">
          {estados.map(e => {
            const h = Math.round((e.value / max) * 100);
            return (
              <div
                key={e.key}
                className="bar"
                style={{ height: `${h}%` }}
              >
                <div className="value">{e.value}</div>
                <div className="label">{e.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Serie */}
      <div className="panel sub">
        <h2>Evolución últimos 7 días</h2>
        <canvas ref={canvasRef} />
      </div>
    </section>
  );
}
