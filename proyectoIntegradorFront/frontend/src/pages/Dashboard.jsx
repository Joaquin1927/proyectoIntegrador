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
console.log("USUARIO", user.email);


const paquetesUsuario = paquetes.filter(
  p => p.createdBy?.toLowerCase() === user?.email?.toLowerCase()
);

const aprobados = paquetesUsuario.filter(
  p => p.estado === "APROBADO"
);

const pendientes = paquetesUsuario.filter(
  p => p.estado === "PENDIENTE"
);

const enRevision = paquetesUsuario.filter(
  p => p.estado === "EN_REVISION"
);

const rechazados = paquetesUsuario.filter(
  p => p.estado === "RECHAZADO"
);

const toneladasRegistradas = paquetesUsuario.reduce(
  (acc, p) => acc + (p.tonCO2eq || 0),
  0
);

const toneladasVerificadas = aprobados.reduce(
  (acc, p) => acc + (p.tonCO2eq || 0),
  0
);
console.log(
  "PAQUETES USUARIO",
  paquetesUsuario.map(p => ({
    id: p.id,
    createdBy: p.createdBy,
    ton: p.tonCO2eq
  }))
);
const paquetesAceptados = aprobados;

const estados = [
  { key: "PENDIENTE", label: "PENDIENTE", value: pendientes.length },
  { key: "EN_REVISION", label: "EN_REVISION", value: enRevision.length },
  { key: "APROBADO", label: "APROBADO", value: aprobados.length },
  { key: "RECHAZADO", label: "RECHAZADO", value: rechazados.length },
];

const max = Math.max(1, ...estados.map(e => e.value));
console.log(
  "PAQUETES USUARIO",
  paquetes.filter(
    p => p.createdBy?.toLowerCase() === user?.email?.toLowerCase()
  )
);
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

      const val = paquetesUsuario
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

<div className="grid four">

  <div className="kpi">
    <div className="kpi-title">Toneladas registradas</div>
    <div className="kpi-value">
      {toneladasRegistradas.toFixed(3)}
    </div>
  </div>

  <div className="kpi">
    <div className="kpi-title">Toneladas verificadas</div>
    <div className="kpi-value">
      {toneladasVerificadas.toFixed(3)}
    </div>
  </div>

  <div className="kpi">
    <div className="kpi-title">Paquetes totales</div>
    <div className="kpi-value">
      {paquetesUsuario.length}
    </div>
  </div>

  <div className="kpi">
    <div className="kpi-title">Aceptados</div>
    <div className="kpi-value">
      {paquetesAceptados.length}
    </div>
  </div>

</div>
    </section>
  );
}
