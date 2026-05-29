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
          <th>Pureza</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {items.map(p => (
          <tr key={p.id}>
            <td>{p.id}</td>
            <td>{p.plantaNombre}</td>
            <td>{p.fecha} {p.hora}</td>
            <td>{p.volumenTon.toFixed(3)}</td>
            <td>{p.pureza.toFixed(1)}%</td>
            <td>
              <span className={`badge ${p.estado}`}>
                {p.estado}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}