import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PlantasPorEmpresa from "../components/PlantasPorEmpresa.jsx";

export default function ListarEmpresas() {
  const API = import.meta.env.VITE_API_URL;

  const { instance, accounts } = useMsal();
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔐 Verificar si el usuario es ADMIN
  const esAdmin = () => {
    const account = accounts[0];
    if (!account?.idTokenClaims?.roles) return false;
    return account.idTokenClaims.roles.includes("ADMIN");
  };

  useEffect(() => {
    if (!esAdmin()) {
      setError("Acceso denegado: solo administradores pueden ver esta página");
      setLoading(false);
      return;
    }

    const fetchEmpresas = async () => {
      try {
        const response = await instance.acquireTokenSilent({
          scopes: [import.meta.env.VITE_SCOPE],
          account: accounts[0],
        });

        const token = response.accessToken;

        const res = await axios.get(`${API}/empresas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEmpresas(res.data);
      } catch (err) {
        setError("Error al obtener empresas: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, []);


  if (loading) return <p>Cargando empresas...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="page-container">
      <h1>🏢 Lista de Empresas</h1>

      {empresas.length === 0 ? (
        <p>No hay empresas registradas.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>N° Corporación</th>
              <th>N° Empresa</th>
              <th>Dirección</th>
              <th>Directores</th>
              <th>Contacto</th>
              <th>Plantas</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((e) => (
              <tr key={e.id}>
                <td>{e.nombre}</td>
                <td>{e.numeroCorporacion}</td>
                <td>{e.numeroEmpresa}</td>
                <td>{e.direccion}</td>
                <td>{e.directores}</td>
                <td>{e.contacto}</td>
                <td>
                  <PlantasPorEmpresa empresaId={e.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
