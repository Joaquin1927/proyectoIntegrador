import { PublicClientApplication } from "@azure/msal-browser";

export const msalInstance = new PublicClientApplication({
  
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: import.meta.env.VITE_AUTHORITY,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,

  },
  scopes: ["openid", "profile", "email"]
});
alert("MSAL CONFIG CARGADO");
console.log("CLIENT_ID:", import.meta.env.VITE_CLIENT_ID);
console.log("AUTHORITY:", import.meta.env.VITE_AUTHORITY);
console.log("REDIRECT_URI:", import.meta.env.VITE_REDIRECT_URI);
