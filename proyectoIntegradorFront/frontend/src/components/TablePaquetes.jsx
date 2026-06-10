
export default function TablePaquetes({ items }) {

  if (!items || items.length === 0) {
    return <p className="muted">Sin registros</p>;
  }

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
            <td>{p.planta?.nombre}</td>
            <td>{p.captureDate}</td>
            <td>{Number(p.tonCO2eq || 0).toFixed(3)}</td>
            <td>{p.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
