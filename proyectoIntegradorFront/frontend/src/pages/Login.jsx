import { msalInstance } from "../auth/msalConfig";

export default function Login() {
  const submit = async () => {
    try {
      await msalInstance.initialize();
      await msalInstance.loginRedirect({
        scopes: [import.meta.env.VITE_SCOPE],
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
      <div className="actions">
        <button className="primary" onClick={submit}>
          Iniciar sesión con Microsoft
        </button>
      </div>
    </section>
  );
}
