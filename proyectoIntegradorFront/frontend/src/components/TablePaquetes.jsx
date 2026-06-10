
export default function TablePaquetes({ items, plantas }) {
  
  if (!items || items.length === 0) {
    return <p className="muted">Sin registros</p>;
  }

const getNombrePlanta = (plantaId) => {
    return plantas.find(p => p.id === Number(plantaId))?.nombre || "—";
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Planta</th>
          <th>Fecha</th>
          <th>Volumen</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {items.map(p => (
          <tr key={p.id}>
            <td>{p.id}</td>
            <td>{getNombrePlanta(p.plantaId)}</td>
            <td>{p.captureDate}</td>
            <td>{Number(p.tonCO2eq || 0).toFixed(3)}</td>
            <td>{p.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
