import { useApp } from "../context/AppContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { setUser } = useApp();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.target));

    try {
      // ✅ 🔥 AHORA LLAMÁS A TU BACKEND JAVA
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email: data.email,
        password: data.password,
      });

      console.log(res.data);

      // ✅ guardar token
      localStorage.setItem("token", res.data.access_token);

      // ✅ determinar rol (provisorio)
      let role = "";

      if (data.email.includes("admin")) {
        role = "admin";
      } else if (data.email.includes("auditor")) {
        role = "auditor";
      } else {
        role = "empleado";
      }

      // ✅ guardar usuario en contexto
      setUser({
        email: data.email,
        role,
      });

      // ✅ redirigir según rol
      if (role === "empleado") {
        navigate("/registrar");
      } else if (role === "auditor") {
        navigate("/pendientes");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error(error);
      alert("Login incorrecto");
    }
  };

  return (
    <section className="panel">
      <h1>Login</h1>

      <form className="grid two" onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input name="email" required />
        </div>

        <div className="field">
          <label>Password</label>
          <input name="password" type="password" required />
        </div>

        <div className="actions span-2">
          <button className="primary">Entrar</button>
        </div>
      </form>
    </section>
  );
}