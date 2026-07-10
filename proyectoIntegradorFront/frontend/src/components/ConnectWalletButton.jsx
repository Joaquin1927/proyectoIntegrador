import { Tooltip } from 'primereact/tooltip';
import { Wallet } from 'lucide-react';
import { useCO2X } from "../web3/useCO2X";

function ConnectWalletButton() {
  const { account, connectWallet } = useCO2X();

  const short = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const tooltipContent = account
    ? `Desconectar desde tu wallet`
    : "Conectar wallet";

  const handleClick = () => {
    if (!account) {
      connectWallet();
    }
    
  };

  return (
    <>
      <Tooltip
        target=".wallet-icon-button"
        content={tooltipContent}
        position="bottom"
        className="wallet-tooltip"
        appendTo={document.body}
      />
      <button
        onClick={handleClick}
        className="wallet-icon-button"
        style={{
          background: "transparent",
          border: "none",
          cursor: account ? "default" : "pointer",
          padding: "0.5rem",
        }}
      >
        <Wallet size={28} color={account ? "#FFD700" : "#DAA520"} />
      </button>
    </>
  );
}

export default ConnectWalletButton;