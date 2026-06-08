import { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { useApp } from "../context/AppContext";
import TablePaquetes from "../components/TablePaquetes";
import { useNavigate } from "react-router-dom";

export default function Registrar() {
  const { plantas, paquetes, setPaquetes, user } = useApp();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user]);

  if (!user) return <p>Cargando...</p>;

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (!file) return;

    if (file.type.includes("json")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const json = JSON.parse(e.target.result);
        setRows(Array.isArray(json) ? json : [json]);
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setRows(result.data);
        },
      });
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const fixedFields = [
    "plantaId",
    "certId",
    "projectName",
    "captureDate",
    "tonCO2eq",
    "beneficiary",
  ];

  const getExtraFields = (row) => {
    return Object.keys(row).filter(
      (key) => !fixedFields.includes(key)
    );
  };

  const saveAll = async () => {
    try {
      const results = [];

      for (const [index, row] of rows.entries()) {
        const payload = {
          certId: row.certId || null,
          projectName: row.projectName || null,
          captureDate: row.captureDate,

          issuanceDate: row.issuanceDate || null,
          retirementDate: row.retirementDate || null,

          tonCO2eq: row.tonCO2eq ? parseFloat(row.tonCO2eq) : null,

          retirementStatus:
            row.retirementStatus === "true" ||
            row.retirementStatus === true,

          estado: "pendiente",

          beneficiary: row.beneficiary || null,
          coBenefits: row.coBenefits || null,
          projectType: row.projectType || null,
          externalUrl: row.externalUrl || null,

          reporteId: row.reporteId ? parseInt(row.reporteId) : null,

          planta: {
            id: parseInt(row.plantaId || plantas[0]?.id),
          },
        };

        try {
          const res = await axios.post(`${API}/paquetes`, payload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          results.push(res.data);
        } catch (err) {
          console.error("Error fila", index, err);
          alert(`Error en fila ${index + 1}`);
        }
      }

      setPaquetes([...results, ...paquetes]);
      alert("Carga completada 🚀");

    } catch (error) {
      console.error(error);
      alert("Error general");
    }
  };

  return (
    <section className="panel">
      <h1>Registrar paquete de captura de CO₂</h1>

      <label
        className="panel sub"
        style={{
          display: "block",
          padding: "40px",
          marginBottom: "20px",
          textAlign: "center",
          cursor: "pointer",
          border: "2px dashed gray",
        }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <p><strong>Arrastrá tu CSV o JSON acá</strong></p>
        <p>o hacé click para seleccionar</p>

        <input
          type="file"
          accept=".csv,.json"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            handleDrop({
              preventDefault: () => {},
              dataTransfer: { files: [file] },
            });
          }}
        />
      </label>

      {rows.map((row, index) => (
        <form key={index} className="grid three panel sub">
          <h3>Registro {index + 1}</h3>

          <div className="field">
            <label>Planta</label>
            <select
              value={row.plantaId || plantas[0]?.id}
              onChange={(e) =>
                handleChange(index, "plantaId", e.target.value)
              }
            >
              {plantas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {Object.keys(row).map((field) => (
            <div className="field" key={field}>
              <label>{field}</label>
              <input
                value={row[field] || ""}
                onChange={(e) =>
                  handleChange(index, field, e.target.value)
                }
              />
            </div>
          ))}
        </form>
      ))}

      {rows.length > 0 && (
        <div className="actions">
          <button type="button" className="primary" onClick={saveAll}>
            Guardar todos
          </button>
        </div>
      )}

      <div className="panel sub">
        <h2>Últimos paquetes cargados</h2>
        <TablePaquetes items={paquetes} />
      </div>
    </section>
  );
}