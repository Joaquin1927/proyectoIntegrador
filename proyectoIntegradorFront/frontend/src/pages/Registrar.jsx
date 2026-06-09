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

  // ✅ EDITAR CAMPOS
  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  // ✅ DETECTAR TIPO INPUT
  const getInputType = (value) => {
    if (typeof value === "number") return "number";
    if (value === "true" || value === "false") return "text";
    return "text";
  };

  // ✅ CONVERTIR VALORES
  const parseValue = (value) => {
    if (value === "") return null;
    if (!isNaN(value)) return parseFloat(value);
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  };

  // ✅ GUARDAR TODO
  const saveAll = async () => {
    try {
      const results = [];

      for (const [index, row] of rows.entries()) {

        // ✅ convertir todos los campos dinámicos
        const parsedRow = {};
        Object.entries(row).forEach(([key, value]) => {
          parsedRow[key] = parseValue(value);
        });

        // 🔥 AQUÍ ES LA CLAVE PARA TU BACK
        const payload = {
          data: parsedRow,   // ✅ TODO dinámico
          plantaId: parseInt(row.plantaId || plantas[0]?.id),
          estado: "pendiente"
        };

        console.log("PAYLOAD:", payload);

        try {
          const res = await axios.post(`${API}/paquetes`, payload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          results.push(res.data);

        } catch (err) {
          console.error("ERROR FILA", index, err.response?.data || err);
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
        <TablePaquetes items={paquetes} />
      </div>
    </section>
  );
}