import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { msalInstance } from "../auth/msalConfig";

export default function Login() {
  const { setUser } = useApp();
  const navigate = useNavigate();

  const submit = async () => {
    try {
      await msalInstance.initialize();
      console.log("CLIENT_ID:", import.meta.env.production.VITE_CLIENT_ID);
      console.log("AUTHORITY:", import.meta.env.production.VITE_AUTHORITY);
      console.log("REDIRECT_URI:", import.meta.env.production.VITE_REDIRECT_URI);
      console.log("API_URL:", import.meta.env.production.VITE_API_URL);
      await msalInstance.loginRedirect({
        scopes: [import.meta.env.production.VITE_SCOPE],
        prompt: "select_account",
      });
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <section className="panel">
      <h1>Login</h1>
      <h1 style={{ color: "red" }}>DEPLOY TEST 10 JULIO - 19:45</h1>
      <div className="actions">
        <button className="primary" onClick={submit}>
          Iniciar sesión con Microsoft
        </button>
      </div>
    </section>
  );
}
