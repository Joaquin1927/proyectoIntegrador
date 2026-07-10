import { useEffect, useMemo, useRef } from "react";
import { useApp } from "../context/AppContext";
import TablePaquetes from "../components/TablePaquetes";
import DashboardImp from "../web3dashboard/dashboardImp";
function getEmail(value) {
  if (!value) return "";
  if (typeof value === "string") return value.toLowerCase();
  return (value.email || value.username || value.mail || "").toLowerCase();
}

export default function Dashboard() {
  const { paquetes, user, cargarPaquetes } = useApp();
  const canvasRef = useRef(null);

  const isAuditor = user?.role === "auditor";
  
const isAdmin =
  user?.role?.toUpperCase() === "ADMIN";

  useEffect(() => {
    cargarPaquetes();
  }, [cargarPaquetes]);

  const paquetesUsuario = useMemo(() => {
    if (!user) return [];

    if (isAuditor) {
      return paquetes.filter(
        (p) => getEmail(p.auditor) === getEmail(user.email)
      );
    }

    return paquetes.filter(
      (p) => getEmail(p.createdBy) === getEmail(user.email)
    );
  }, [isAuditor, paquetes, user]);

  const aprobados = paquetesUsuario.filter((p) => p.estado === "APROBADO");
  const pendientes = paquetesUsuario.filter((p) => p.estado === "PENDIENTE");
  const enRevision = paquetesUsuario.filter((p) => p.estado === "EN_REVISION");
  const rechazados = paquetesUsuario.filter((p) => p.estado === "RECHAZADO");

  const toneladasRegistradas = paquetesUsuario.reduce(
    (acc, p) => acc + (p.tonCO2eq || 0),
    0
  );

  const toneladasVerificadas = aprobados.reduce(
    (acc, p) => acc + (p.tonCO2eq || 0),
    0
  );

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    const W = (c.width = c.clientWidth);
    const H = (c.height = 160);

    ctx.clearRect(0, 0, W, H);

    const days = Array.from({ length: 7 }).map((_, k) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - k));
      const key = d.toISOString().slice(0, 10);

      const val = paquetesUsuario
        .filter((p) => p.captureDate === key && p.estado === "APROBADO")
        .reduce((a, b) => a + (b.tonCO2eq || 0), 0);

      return { key, val };
    });

    const maxVal = Math.max(1, ...days.map((d) => d.val));

    ctx.strokeStyle = "#2bd48d";
    ctx.beginPath();

    days.forEach((d, i) => {
      const x = 30 + i * ((W - 50) / 6);
      const y = H - 20 - (d.val / maxVal) * (H - 40);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [paquetesUsuario]);

  if (!user) {
    return (
      <section className="panel">
        <h1>Dashboard</h1>
        <p>Cargando usuario...</p>
      </section>
    );
  }

  if (isAdmin) {
    return <DashboardImp />;
  }

  return (
    <section className="panel">
      <h1>Dashboard</h1>

      {!isAuditor && (
        <div className="grid four">
          <div className="kpi">
            <div className="kpi-title">Toneladas registradas</div>
            <div className="kpi-value">{toneladasRegistradas.toFixed(3)}</div>
          </div>

          <div className="kpi">
            <div className="kpi-title">Toneladas verificadas</div>
            <div className="kpi-value">{toneladasVerificadas.toFixed(3)}</div>
          </div>

          <div className="kpi">
            <div className="kpi-title">Paquetes totales</div>
            <div className="kpi-value">{paquetesUsuario.length}</div>
          </div>
        </div>
      )}

      {isAuditor && (
        <div className="panel sub">
          <h2>Paquetes auditados</h2>
          <TablePaquetes items={paquetesUsuario} />
        </div>
      )}

      <canvas ref={canvasRef} style={{ width: "100%", height: "160px" }} />
    </section>
  );
}
