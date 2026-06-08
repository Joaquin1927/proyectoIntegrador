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

  // ✅ PARSEAR ARCHIVO
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

  // ✅ EDITAR CAMPO
  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  // ✅ CAMPOS FIJOS
  const fixedFields = [
    "plantaId",
    "certId",
    "projectName",
    "captureDate",
    "tonCO2eq",
    "beneficiary",
  ];

  // ✅ CAMPOS DINÁMICOS
  const getExtraFields = (row) => {
    return Object.keys(row).filter(
      (key) => !fixedFields.includes(key)
    );
  };

  // ✅ GUARDAR TODO
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

  // ✅ PARSEAR ARCHIVO
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

  // ✅ EDITAR CAMPO
  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  // ✅ CAMPOS FIJOS
  const fixedFields = [
    "plantaId",
    "certId",
    "projectName",
    "captureDate",
    "tonCO2eq",
    "beneficiary",
  ];

  // ✅ CAMPOS DINÁMICOS
  const getExtraFields = (row) => {
    return Object.keys(row).filter(
      (key) => !fixedFields.includes(key)
    );
  };

  // ✅ GUARDAR TODO
const saveAll = async () => {
  try {
    const results = [];

    for (const [index, row] of rows.entries()) {
      console.log("ENVIANDO FILA", index, row);

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

      console.log("PAYLOAD:", payload);

      try {
        const res = await axios.post(`${API}/paquetes`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("CREADO:", res.data);
        results.push(res.data);

      } catch (err) {
        console.error("ERROR EN FILA", index, err.response?.data || err);
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

      {/* ✅ DROP + FILE PICKER */}
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

            const fakeEvent = {
              preventDefault: () => {},
              dataTransfer: { files: [file] },
            };

            handleDrop(fakeEvent);
          }}
        />
      </label>

      {/* ✅ FORMULARIOS */}
      {rows.map((row, index) => (
        <form key={index} className="grid three panel sub">
          <h3>Registro {index + 1}</h3>

          {/* FIJOS */}
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

          <div className="field">
            <label>Cert ID</label>
            <input
              value={row.certId || ""}
              onChange={(e) =>
                handleChange(index, "certId", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>Project Name</label>
            <input
              value={row.projectName || ""}
              onChange={(e) =>
                handleChange(index, "projectName", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>Fecha captura</label>
            <input
              type="date"
              value={row.captureDate || ""}
              onChange={(e) =>
                handleChange(index, "captureDate", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>CO₂</label>
            <input
              type="number"
              value={row.tonCO2eq || ""}
              onChange={(e) =>
                handleChange(index, "tonCO2eq", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>Beneficiary</label>
            <input
              value={row.beneficiary || ""}
              onChange={(e) =>
                handleChange(index, "beneficiary", e.target.value)
              }
            />
          </div>

          {/* ✅ DINÁMICOS */}
          {getExtraFields(row).map((field) => (
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

      {/* ✅ BOTÓN */}
      {rows.length > 0 && (
        <div className="actions">
          <button className="primary" onClick={saveAll}>
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
  return (
    <section className="panel">
      <h1>Registrar paquete de captura de CO₂</h1>

      {/* ✅ DROP + FILE PICKER */}
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

            const fakeEvent = {
              preventDefault: () => {},
              dataTransfer: { files: [file] },
            };

            handleDrop(fakeEvent);
          }}
        />
      </label>

      {/* ✅ FORMULARIOS */}
      {rows.map((row, index) => (
        <form key={index} className="grid three panel sub">
          <h3>Registro {index + 1}</h3>

          {/* FIJOS */}
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

          <div className="field">
            <label>Cert ID</label>
            <input
              value={row.certId || ""}
              onChange={(e) =>
                handleChange(index, "certId", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>Project Name</label>
            <input
              value={row.projectName || ""}
              onChange={(e) =>
                handleChange(index, "projectName", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>Fecha captura</label>
            <input
              type="date"
              value={row.captureDate || ""}
              onChange={(e) =>
                handleChange(index, "captureDate", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>CO₂</label>
            <input
              type="number"
              value={row.tonCO2eq || ""}
              onChange={(e) =>
                handleChange(index, "tonCO2eq", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>Beneficiary</label>
            <input
              value={row.beneficiary || ""}
              onChange={(e) =>
                handleChange(index, "beneficiary", e.target.value)
              }
            />
          </div>

          {/* ✅ DINÁMICOS */}
          {getExtraFields(row).map((field) => (
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

      {/* ✅ BOTÓN */}
      {rows.length > 0 && (
        <div className="actions">
          <button className="primary" onClick={saveAll}>
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