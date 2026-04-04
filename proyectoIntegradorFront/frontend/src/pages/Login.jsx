import { useApp } from "../context/AppContext";

export default function Login() {
  const { setUser } = useApp();

  const submit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    setUser({
      id: data.email,
      name: data.name,
      role: data.role,
    });
    if (data.role === "empleado") {
      window.location.hash = "#registrar";
    } else if (data.role === "auditor") {
      window.location.hash = "#pendientes";
    } else {
      window.location.hash = "#dashboard";
    }
  };

  

  return (
    <section className="panel">
      <h1>Bienvenida/o</h1>

      <form className="grid two" onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input name="email" required />
        </div>

        <div className="field">
          <label>Nombre</label>
          <input name="name" required />
        </div>

        <div className="field">
          <label>Rol</label>
          <select name="role">
            <option value="empleado">Empleado</option>
            <option value="auditor">Auditor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="actions span-2">
          <button className="primary">Entrar</button>
        </div>
      </form>
    </section>
  );
}
