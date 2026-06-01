<<<<<<< HEAD
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
 
function Login() {
  const { instance, accounts } = useMsal();
  const navigate = useNavigate();
 
  useEffect(() => {
    if (accounts.length > 0) {
      navigate("/dashboard");
    }
  }, [accounts, navigate]);
 
  const login = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error(error);
=======
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { msalInstance } from "../auth/msalConfig";

export default function Login() {
  const { setUser } = useApp();
  const navigate = useNavigate();

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
>>>>>>> develop
    }
  };
 
  return (
<<<<<<< HEAD
<div className="panel">
<h1>CO₂X</h1>
 
      <button onClick={login}>
        Iniciar sesión con Microsoft
</button>
</div>
=======
    <section className="panel">
      <h1>Login</h1>

      <div className="actions">
        <button className="primary" onClick={submit}>
          Iniciar sesión con Microsoft
        </button>
      </div>
    </section>
>>>>>>> develop
  );
}
 
export default Login;