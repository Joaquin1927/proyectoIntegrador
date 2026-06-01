import { PublicClientApplication } from "@azure/msal-browser";

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: "36920833-e50a-48be-b51a-e363b373c011",
    authority: "https://login.microsoftonline.com/cbb64725-bd29-4b87-93b2-e5fcf09ff37f",
    redirectUri: "http://localhost:5173",
  },
});