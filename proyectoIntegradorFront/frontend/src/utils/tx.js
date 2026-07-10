import { parseEthersError } from "./errors";

export async function withTx(toast, action, { pending="Enviando transacción…", success="Listo ✔" } = {}) {
  try {
    toast.info(pending);
    const tx = await action();
    if (tx?.wait) {
      const r = await tx.wait();
      toast.success(success);
      return r;
    } else {
      // acciones no on-chain (ej. add token to wallet)
      toast.success(success);
      return tx;
    }
  } catch (e) {
    const { userMessage } = parseEthersError(e);
    toast.error(userMessage);
    throw e;
  }
}