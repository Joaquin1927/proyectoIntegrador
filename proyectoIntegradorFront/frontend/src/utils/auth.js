export async function getAccessToken(instance, accounts) {
 
const response = await instance.acquireTokenSilent({
scopes: [import.meta.env.VITE_SCOPE],
account: accounts[0],
});
 
return response.accessToken;
}