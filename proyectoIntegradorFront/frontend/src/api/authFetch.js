export async function authFetch(
url,
options,
instance,
accounts
) {
 
const token =
await getAccessToken(instance, accounts);
 
const headers = new Headers(
options?.headers || {}
);
 
headers.set(
"Authorization",
`Bearer ${token}`
);
 
return fetch(url, {
...options,
headers,
});
}