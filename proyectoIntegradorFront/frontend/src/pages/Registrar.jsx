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

  const paquetesUsuario = paquetes.filter(
    p =>
      p.createdBy &&
      user?.email &&
      p.createdBy.toLowerCase().trim() === user.email.toLowerCase().trim()
  );

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

  // ✅ EDITAR CAMPOS
  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };


  const fixedFields = [
    "plantaId",
    "captureDate",
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

      const extraFields = {};

      Object.keys(row).forEach((key) => {
        if (!fixedFields.includes(key)) {
          extraFields[key] = row[key];
        }
      });

      if (!extraFields.tonCO2eq) {
        alert(`Falta tonCO2eq en fila ${index + 1}`);
        continue;
      }

      extraFields.tonCO2eq = parseFloat(extraFields.tonCO2eq);

      const payload = {
        captureDate: row.captureDate || null,
        plantaId: parseInt(row.plantaId || plantas[0]?.id),
        metadata: JSON.stringify(extraFields),
        createdBy: user.email
      };
      console.log("Payload enviado:", payload);
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

    setPaquetes(prev => [...results, ...(prev || [])])
    alert("Carga completada 🚀");

  } catch (error) {
    alert("Error general");
  }
};


  return (
    <section className="panel">
      <h1>Registrar paquete de captura de CO₂</h1>

      {/* DROP ZONE */}
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

      {/* FORM DINÁMICO */}
      {rows.map((row, index) => (
        <form key={index} className="grid three panel sub">
          <h3>Registro {index + 1}</h3>

          {/* ✅ Planta (único campo controlado) */}
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

          {/* ✅ CAMPOS DINÁMICOS */}
          {Object.entries(row).map(([field, value]) => (
            <div className="field" key={field}>
              <label>{field}</label>

              <input
                type={getInputType(value)}
                value={value || ""}
                onChange={(e) =>
                  handleChange(index, field, e.target.value)
                }
              />
            </div>
          ))}
        </form>
      ))}

      {/* BOTÓN */}
      {rows.length > 0 && (
        <div className="actions">
          <button type="button" className="primary" onClick={saveAll}>
            Guardar todos
          </button>
        </div>
      )}

      <div className="panel sub">
        <h2>Últimos paquetes cargados</h2>
        <TablePaquetes items={paquetesUsuario} />
      </div>
    </section>
  );
}