import { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { useApp } from "../context/AppContext";
import TablePaquetes from "../components/TablePaquetes";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export default function Registrar() {
  const { plantas, paquetes, setPaquetes, user } = useApp();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [rows, setRows] = useState([]);
  const { instance, accounts } = useMsal();
  const paquetesUsuario = paquetes;

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

        const filas = Array.isArray(json) ? json : [json];

        const filasCorregidas = filas.map((row) => {
          const planta = plantas.find((p) => p.id === row.plantaId + 1);

          return {
            ...row,
            plantaId: planta?.id ?? row.plantaId,
          };
        });

        setRows(filasCorregidas);
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

  const fixedFields = ["plantaId", "captureDate"];

  const getExtraFields = (row) => {
    return Object.keys(row).filter((key) => !fixedFields.includes(key));
  };

  const getInputType = (value) => {
    if (value === null || value === undefined) return "text";
    if (!isNaN(value) && value !== "") return "number";

    // detectar fecha simple
    if (typeof value === "string" && !isNaN(Date.parse(value))) {
      return "date";
    }

    return "text";
  };

  const saveAll = async () => {
    try {
      const response = await instance.acquireTokenSilent({
        scopes: ["api://36920833-e50a-48be-b51a-e363b373c011/access_as_user"],
        account: accounts[0],
      });
      const token = response.accessToken;
      const results = [];
      const errores = [];
      let successCount = 0;
      let errorCount = 0;
      for (const [index, row] of rows.entries()) {
        const extraFields = {};
        Object.keys(row).forEach((key) => {
          if (!fixedFields.includes(key)) {
            extraFields[key] = row[key];
          }
        });
        if (!extraFields.tonCO2eq) {
          errores.push(`Fila ${index + 1}: Falta el campo tonCO2eq`);
          errorCount++;
          continue;
        }
        extraFields.tonCO2eq = parseFloat(extraFields.tonCO2eq);
        if (!row.plantaId) {
          errores.push(`Fila ${index + 1}: Falta seleccionar una planta`);
          errorCount++;
          continue;
        }
        const payload = {
          captureDate: row.captureDate || null,
          planta: {
            id: parseInt(row.plantaId),
          },
          metadata: JSON.stringify(extraFields),
        };

        console.log("Payload enviado:", payload);

        try {
          console.log("FILA ORIGINAL:", row);
          console.log("EXTRAFIELDS:", extraFields);
          console.log("TOKEN:", token);
          console.log("PAYLOAD:", payload);
          const res = await axios.post(`${API}/paquetes`, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          results.push(res.data);
          successCount++;
        } catch (err) {
          console.error("Error fila", index, err);
          const backendMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Error desconocido";
          errores.push(`Fila ${index + 1}: ${backendMessage}`);
          errorCount++;
        }
      }
      setPaquetes((prev) => [...results, ...(prev || [])]);
      if (successCount > 0 && errorCount === 0) {
        alert(`Carga completada 🚀\n${successCount} paquetes registrados.`);
      } else if (successCount > 0 && errorCount > 0) {
        alert(
          `Carga parcial.\n` +
            `${successCount} paquetes registrados.\n` +
            `${errorCount} paquetes con error.\n\n` +
            errores.join("\n"),
        );
      } else {
        alert(`No se registró ningún paquete.\n\n` + errores.join("\n"));
      }
    } catch (error) {
      console.error(error);
      alert("Error obteniendo el token de autenticación.");
    }
  };

  console.log("PLANTAS:", plantas);
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
        <p>
          <strong>Arrastrá tu CSV o JSON acá</strong>
        </p>
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
              value={row.plantaId || ""}
              onChange={(e) => handleChange(index, "plantaId", e.target.value)}
            >
              <option value="" disabled hidden>
                Seleccionar planta
              </option>

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
                onChange={(e) => handleChange(index, field, e.target.value)}
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
        <TablePaquetes items={paquetesUsuario} plantas={plantas} />
      </div>
    </section>
  );
}
