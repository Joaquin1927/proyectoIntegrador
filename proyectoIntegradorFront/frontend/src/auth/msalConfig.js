import { PublicClientApplication } from "@azure/msal-browser";

const azureClientId =
  import.meta.env.VITE_CLIENT_ID || "36920833-e50a-48be-b51a-e363b373c011";

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: azureClientId,
    authority: import.meta.env.VITE_AUTHORITY,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
  },
  scopes: ["openid", "profile", "email"]
});
