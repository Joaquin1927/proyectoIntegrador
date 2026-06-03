import { useEffect } from "react";
import axios from "axios";
import { useApp } from "../context/AppContext";
import TablePaquetes from "../components/TablePaquetes";
import { useNavigate } from "react-router-dom";

export default function Registrar() {
  const { plantas, paquetes, setPaquetes, user } = useApp();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user]);

  if (!user) return <p>Cargando...</p>;

  const submit = async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.target));
console.log("FORM DATA", data);
console.log("plantaId =", data.plantaId);
console.log("parseInt =", parseInt(data.plantaId));
    const payload = {
      certId: data.certId || null,
      projectName: data.projectName || null,
      captureDate: data.captureDate,

      issuanceDate: data.issuanceDate || null,
      retirementDate: data.retirementDate || null,

      tonCO2eq: parseFloat(data.tonCO2eq),
      retirementStatus: data.retirementStatus === "true",

      estado: "pendiente",

      beneficiary: data.beneficiary || null,
      coBenefits: data.coBenefits || null,
      projectType: data.projectType || null,
      externalUrl: data.externalUrl || null,

      reporteId: data.reporteId ? parseInt(data.reporteId) : null,

      planta: {
        id: parseInt(data.plantaId),
      },
    };

    try {
      console.log(payload);
      const res = await axios.post(
        `${API}/paquetes`, // ✅ usando variable
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("CREADO:", res.data);

      setPaquetes([res.data, ...paquetes]);
      e.target.reset();

    } catch (error) {
      console.error(error);
      alert("Error al guardar paquete");
    }
  };
console.log("PLANTAS:", plantas);
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
          <label>Cert ID</label>
          <input name="certId" required />
        </div>

        <div className="field">
          <label>Project Name</label>
          <input name="projectName" required />
        </div>

        <div className="field">
          <label>Fecha de captura</label>
          <input type="date" name="captureDate" required />
        </div>

        <div className="field">
          <label>Fecha de emisión</label>
          <input type="date" name="issuanceDate" />
        </div>

        <div className="field">
          <label>Fecha retiro</label>
          <input type="date" name="retirementDate" />
        </div>

        <div className="field">
          <label>CO₂ capturado (ton)</label>
          <input type="number" step="0.001" name="tonCO2eq" required />
        </div>

        <div className="field">
          <label>Tipo de proyecto</label>
          <input name="projectType" />
        </div>

        <div className="field">
          <label>Retirement status</label>
          <select name="retirementStatus">
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        </div>

        <div className="field">
          <label>Beneficiary</label>
          <input name="beneficiary" />
        </div>

        <div className="field">
          <label>Co-benefits</label>
          <input name="coBenefits" />
        </div>

        <div className="field">
          <label>External URL</label>
          <input name="externalUrl" />
        </div>

        <div className="field">
          <label>Reporte ID</label>
          <input type="number" name="reporteId" />
        </div>

        <div className="actions span-3">
          <button className="primary">Guardar paquete</button>
        </div>
      </form>

      <div className="panel sub">
        <h2>Últimos paquetes cargados</h2>
        <TablePaquetes items={paquetes} />
      </div>
    </section>
  );
}