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
    }
  };
 
  return (
<div className="panel">
<h1>CO₂X</h1>
 
      <button onClick={login}>
        Iniciar sesión con Microsoft
</button>
</div>
  );
}
 
export default Login;