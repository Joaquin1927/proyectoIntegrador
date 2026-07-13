import { msalInstance } from "../auth/msalConfig";

const obtenerToken = async () => {
  const account = msalInstance.getActiveAccount();
  if (!account) return null;

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes: [import.meta.env.VITE_SCOPE],
      account
    });

    return response.accessToken;
  } catch (err) {
    console.error("Error obteniendo token:", err);
    return null;
  }
};

export const apiGet = async (url, requireAuth = true) => {
  const headers = {};

  if (requireAuth) {
    const token = await obtenerToken();
    if (!token) throw new Error("No hay una sesión autenticada");
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { headers });
};

export const apiPost = async (url, body, requireAuth = true) => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (requireAuth) {
    const token = await obtenerToken();
    if (!token) throw new Error("No hay una sesión autenticada");
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
};
