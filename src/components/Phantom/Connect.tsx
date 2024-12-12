import {
  WalletDisconnectButton,
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
require("@solana/wallet-adapter-react-ui/styles.css");

import { useWallet } from '@solana/wallet-adapter-react';

export default function SolanaConnect() {
  const wallet = useWallet()

  return (
    <WalletModalProvider>
      {!wallet.connected && <WalletMultiButton className="bg-primary text-white" />}
      {wallet.connected && <WalletDisconnectButton className="bg-primary text-white" />}
    </WalletModalProvider>
  );
}
