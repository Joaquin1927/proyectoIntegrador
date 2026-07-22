// AuthGuard.jsx
import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthGuard() {
  const { accounts } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accounts || accounts.length === 0) return;

    const account = accounts[0];
    const roles = account.idToken.roles || [];

    console.log("Roles del usuario:", roles);

    // Usuario sin rol → bloquear login
    if (roles.length === 0) {
      navigate("/sin-rol");
    }
  }, [accounts, navigate]);

  return null;
}
