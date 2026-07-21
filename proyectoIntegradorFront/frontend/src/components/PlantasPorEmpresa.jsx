import { useEffect, useState } from "react";
import axios from "axios";
import { useMsal } from "@azure/msal-react";

export default function PlantasPorEmpresa({ empresaId }) {
  const API = import.meta.env.VITE_API_URL;
  const { instance, accounts } = useMsal();
  const [plantas, setPlantas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlantas = async () => {
      try {
        const response = await instance.acquireTokenSilent({
          scopes: [import.meta.env.VITE_SCOPE],
          account: accounts[0],
        });

        const token = response.accessToken;

        const res = await axios.get(`${API}/plantas/byEmpresa/${empresaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPlantas(res.data);
      } catch (err) {
        console.error("Error cargando plantas:", err);
        setPlantas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantas();
  }, [empresaId]);

  if (loading) return <span>Cargando...</span>;

  if (plantas.length === 0) return <span>Sin plantas</span>;

  return <span>{plantas.map((p) => p.nombre).join(", ")}</span>;
}
