import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

function Login() {
  const { instance } = useMsal();

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button onClick={login}>
        Iniciar sesión con Microsoft
      </button>
    </div>
  );
}

export default Login;