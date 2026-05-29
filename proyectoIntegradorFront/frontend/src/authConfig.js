import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "1c9e0bc2-d8c4-4bbc-98c8-e86d822a7c19", // EL CORRECTO
    authority: "https://login.microsoftonline.com/cbb64725-bd29-4b87-93b2-e5fcf09ff37f", // TU TENANT ORT
    redirectUri: "http://localhost:5173/home",
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};

export const msalInstance = new PublicClientApplication(msalConfig);
