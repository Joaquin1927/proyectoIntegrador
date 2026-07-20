export async function getAccessToken(instance) {

  const account =
    instance.getActiveAccount() ||
    instance.getAllAccounts()[0];

  if (!account) {
    throw new Error("No hay ninguna cuenta autenticada");
  }

  const response = await instance.acquireTokenSilent({
    scopes: [import.meta.env.VITE_SCOPE],
    account,
  });

  return response.accessToken;
}