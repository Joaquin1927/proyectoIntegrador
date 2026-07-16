import { useEffect, useMemo, useRef } from "react";
import { useApp } from "../context/AppContext";
import TablePaquetes from "../components/TablePaquetes";
import DashboardImp from "../web3dashboard/dashboardImp";
import { useMsal } from "@azure/msal-react";

const API = import.meta.env.VITE_API_URL;

function getEmail(value) {
  if (!value) return "";
  if (typeof value === "string") return value.toLowerCase();
  return (value.email || value.username || value.mail || "").toLowerCase();
}

async function obtenerFechaAprobacion(paqueteId, API, accessToken) {
  const res = await fetch(`${API}/historial/${paqueteId}/getHistorial`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) return null;

  const historial = await res.json();

  // ⬅️ CAMBIO CLAVE: usar "accion" en vez de "estado"
  const aprobado = historial.find(
    (h) => (h.accion || "").toUpperCase() === "APROBADO"
  );

  if (!aprobado || !aprobado.fecha) return null;

  return new Date(aprobado.fecha);
}

async function obtenerAprobadosPorMes(paquetesAprobados, API, accessToken) {
  const fechas = [];

  for (const p of paquetesAprobados) {
    const fecha = await obtenerFechaAprobacion(p.id, API, accessToken);
    if (fecha) fechas.push(fecha);
  }

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const mesPasado = mesActual === 0 ? 11 : mesActual - 1;
  const añoActual = ahora.getFullYear();
  const añoMesPasado = mesActual === 0 ? añoActual - 1 : añoActual;

  const aprobadosMesActual = fechas.filter(
    (f) => f.getMonth() === mesActual && f.getFullYear() === añoActual
  ).length;

  const aprobadosMesPasado = fechas.filter(
    (f) => f.getMonth() === mesPasado && f.getFullYear() === añoMesPasado
  ).length;

  return { aprobadosMesActual, aprobadosMesPasado };
}

export default function Dashboard() {
  const { paquetes, user, cargarPaquetes } = useApp();
  const { instance } = useMsal();

  const canvasRef = useRef(null);
  const graficoRef = useRef(null);

  const isAuditor = user?.role === "auditor";
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

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

  const pendientesGlobal = paquetes.filter(
    (p) => (p.estado || "").toUpperCase() === "PENDIENTE"
  );

  const aprobados = paquetesUsuario.filter(
    (p) => (p.estado || "").toUpperCase() === "APROBADO"
  );

  const enRevision = paquetesUsuario.filter(
    (p) => (p.estado || "").toUpperCase() === "EN_REVISION"
  );

  const enRevisionCorregido = paquetesUsuario.filter(
    (p) => (p.estado || "").toUpperCase() === "EN_REVISION_CORREGIDO"
  );

  const rechazados = paquetesUsuario.filter(
    (p) => (p.estado || "").toUpperCase() === "RECHAZADO"
  );

  const toneladasRegistradas = paquetesUsuario.reduce(
    (acc, p) => acc + (p.tonCO2eq || 0),
    0
  );

  const toneladasVerificadas = aprobados.reduce(
    (acc, p) => acc + (p.tonCO2eq || 0),
    0
  );

  // Gráfico de línea
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

  // Gráfico de barras
  useEffect(() => {
    if (!isAuditor) return;

    async function cargarGrafico() {
      const account = instance.getActiveAccount();
      if (!account) return;

      const response = await instance.acquireTokenSilent({
        account,
      });

      const accessToken = response.accessToken;

      const aprobados = paquetesUsuario.filter(
        (p) => (p.estado || "").toUpperCase() === "APROBADO"
      );

      const { aprobadosMesActual, aprobadosMesPasado } =
        await obtenerAprobadosPorMes(aprobados, API, accessToken);

      console.log("MES ACTUAL:", aprobadosMesActual);
      console.log("MES PASADO:", aprobadosMesPasado);

      const canvas = graficoRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const W = (canvas.width = canvas.clientWidth);
      const H = (canvas.height = 200);

      ctx.clearRect(0, 0, W, H);

      const datos = [aprobadosMesPasado, aprobadosMesActual];
      const labels = ["Mes pasado", "Mes actual"];

      const maxVal = Math.max(...datos, 1);
      const barWidth = W / 4;

      datos.forEach((val, i) => {
        const x = (i + 1) * (W / 3) - barWidth / 2;
        const y = H - (val / maxVal) * (H - 40);

        ctx.fillStyle = "#2bd48d";
        ctx.fillRect(x, y, barWidth, H - y);

        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        ctx.fillText(labels[i], x, H - 10);

        ctx.fillText(val, x + barWidth / 2 - 10, y - 10);
      });
    }

    cargarGrafico();
  }, [paquetesUsuario, isAuditor, instance]);

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
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              className="kpi"
              style={{ fontSize: "22px", padding: "20px", flex: 1 }}
            >
              <div className="kpi-title">Pendientes (global)</div>
              <div className="kpi-value">{pendientesGlobal.length}</div>
            </div>

            <div
              className="kpi"
              style={{ fontSize: "22px", padding: "20px", flex: 1 }}
            >
              <div className="kpi-title">Revisión corregida</div>
              <div className="kpi-value">{enRevisionCorregido.length}</div>
            </div>

            <div
              className="kpi"
              style={{ fontSize: "22px", padding: "20px", flex: 1 }}
            >
              <div className="kpi-title">En revisión</div>
              <div className="kpi-value">{enRevision.length}</div>
            </div>

            <div
              className="kpi"
              style={{ fontSize: "22px", padding: "20px", flex: 1 }}
            >
              <div className="kpi-title">Aprobados</div>
              <div className="kpi-value">{aprobados.length}</div>
            </div>

            <div
              className="kpi"
              style={{ fontSize: "22px", padding: "20px", flex: 1 }}
            >
              <div className="kpi-title">Rechazados</div>
              <div className="kpi-value">{rechazados.length}</div>
            </div>
          </div>

          <canvas
            ref={graficoRef}
            style={{ width: "100%", height: "200px", marginTop: "30px" }}
          ></canvas>
        </>
      )}

      <canvas ref={canvasRef} style={{ width: "100%", height: "160px" }} />
    </section>
  );
}
