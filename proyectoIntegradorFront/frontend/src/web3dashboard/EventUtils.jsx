const TRANSFER_IFACE = new ethers.Interface([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);
const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");
const pad32 = (addr) => ethers.zeroPadValue(addr, 32);
 
// Minted(to, amount, certId) — certId is NOT indexed
const MINTED_IFACE = new ethers.Interface([
  "event Minted(address indexed to, uint256 amount, string certId)",
]);
const MINTED_TOPIC = ethers.id("Minted(address,uint256,string)");
 