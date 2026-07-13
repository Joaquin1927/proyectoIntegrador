// src/web3/provider.js
import { JsonRpcProvider, FallbackProvider, BrowserProvider } from "ethers";
 
const CHAIN = { chainId: 80002, name: "polygon-amoy" };
 
// --- helpers para limpiar y validar URLs
function isValid(u) {
  if (!u) return false;
  const s = String(u).trim();
  // ignorar placeholders/comentarios rotos
  if (/YYYY|XXXX|TU_KEY|YOUR_KEY|undefined|null/i.test(s)) return false;
  return true;
}
function uniqTrim(arr) {
  return [...new Set(arr.map((s) => String(s).trim()))];
}
 
// toma env, trimea, quita duplicados y placeholders
const urls = uniqTrim([
  import.meta.env.VITE_RPC_PRIMARY,
  import.meta.env.VITE_RPC_FALLBACK,
]).filter(isValid);
 
if (urls.length === 0) {
  throw new Error("No RPC URLs configured. Set VITE_RPC_PRIMARY in .env");
}
 
// crear providers fijando la red -> evita 'detect network' y 'network changed'
const providers = urls.map((u) => new JsonRpcProvider(u, CHAIN));
 
// Lecturas: fallback (o único) según cuántas URLs pasaron el filtro
export const readProvider =
  providers.length === 1
    ? providers[0]
    : new FallbackProvider(
        [
          { provider: providers[0], weight: 2, stallTimeout: 900 },
          { provider: providers[1], weight: 1, stallTimeout: 900 },
        ],
        1 // quorum: con 1 que responda, alcanza
      );
 
// Provider de wallet (MetaMask) para firmar escrituras
export async function getWalletProvider() {
  const eth = window.ethereum;
  if (!eth) throw new Error("MetaMask not detected");
  return new BrowserProvider(eth, "any"); // "any" evita cachear chainId
}
 
export async function getSigner() {
  const walletProvider = await getWalletProvider();
  return walletProvider.getSigner();
}
 
// (Opcional) asegurar red Amoy (80002)
export async function ensureAmoy() {
  const eth = window.ethereum;
  if (!eth) return;
 
  // usa las mismas URLs saneadas para registrar la red en la wallet
  const rpcUrls = urls.length ? urls : [import.meta.env.VITE_RPC_PRIMARY].filter(Boolean);
 
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13882" }], // 80002 hex
    });
  } catch (e) {
    if (e && e.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x13882",
            chainName: "Polygon Amoy",
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            rpcUrls,
            blockExplorerUrls: ["https://www.oklink.com/amoy"],
          },
        ],
      });
    } else {
      throw e;
    }
  }
}
 
// (Opcional) debug rápido para confirmar chainIds de cada RPC
export async function debugReadProviders() {
  const nets = await Promise.all(providers.map((p) => p.getNetwork()));
  console.log("[readProvider] urls:", urls);
  console.log("[readProvider] chainIds:", nets.map((n) => Number(n.chainId)));
}