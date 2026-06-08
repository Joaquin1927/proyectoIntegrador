export default function TablePaquetes({ items }) {
  if (!items.length) {
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
            <td>{p.tonCO2eq?.toFixed(3)}</td>
            <td>{p.estado}</td> 
          </tr>
        ))}
      </tbody>
    </table>
  );
}