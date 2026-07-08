// src/utils/errors.js

// Extract raw message from different ethers/provider shapes
function extractRaw(err) {
  return (
    err?.shortMessage ||
    err?.info?.error?.message ||
    err?.error?.message ||
    err?.data?.message ||
    err?.message ||
    String(err)
  );
}

// Friendly, readable messages you DO want to show in toasts
const FRIENDLY_MAP = [
  { key: "Pausable: paused", msg: "Contract is paused." },
  { key: "Pausable: not paused", msg: "Contract is already unpaused." },
  { key: "OwnableUnauthorizedAccount", msg: "You do not have permission (owner only)." },
  { key: "Not verifier", msg: "Only the verifier or owner can mint." },
  { key: "insufficient funds", msg: "Insufficient funds for gas." },
  { key: "user rejected", msg: "Action cancelled in wallet." },
  { key: "Amount must be greater than zero", msg: "Amount must be greater than zero." },
  { key: "ERC20InsufficientBalance", msg: "Insufficient balance for this operation." },
  { key: "ERC20InsufficientAllowance", msg: "Allowance too low." },
  { key: "Wrong network", msg: "You are on the wrong network." },   
  { key: "Invalid recipient address", msg: "Recipient address is not valid." }, 
  { key: "execution reverted", msg: "Transaction reverted. Check permissions, network and params." },
];

export function parseEthersError(err) {
  const raw = extractRaw(err);
  const lower = raw.toLowerCase();
  const code = err?.code;

  const tags = {
    isInternalRpc: String(code) === "-32603",
    isPendingRequest: String(code) === "-32002",
    isCoalesce: /coalesce/.test(lower),        // e.g. "could not coalesce error"
    mentionsGetLogs: /getlogs/.test(lower),
  };

  // Find if it matches a friendly message the user is OK seeing in a toast
  const mapped = FRIENDLY_MAP.find((m) =>
    lower.includes(m.key.toLowerCase())
  );

  return { raw, code, tags, mappedMsg: mapped?.msg || null };
}

// Toast decision:
// - If it matched one of the FRIENDLY_MAP keys -> show that message.
// - Otherwise -> generic "Network issue".
export function toastMessageFromError(err) {
  const { mappedMsg } = parseEthersError(err);
  return mappedMsg || "Network issue";
}

// Always log full details to console for diagnostics
export function logEthersError(err, context = {}) {
  const parsed = parseEthersError(err);
  console.groupCollapsed("%c[CO₂X] RPC/Error", "color:#DAA520;font-weight:700");
  if (Object.keys(context).length) console.log("Context:", context);
  console.log("Code:", parsed.code);
  console.log("Tags:", parsed.tags);
  console.log("Raw message:", parsed.raw);
  console.log("Original error object:", err);
  console.groupEnd();
}