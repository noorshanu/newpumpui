/* eslint-disable @next/next/no-img-element */
"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bscTestnet,
  bsc
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection } from '@solana/web3.js';

const config = getDefaultConfig({
  appName: 'demo',
  projectId: 'd753ca2da5b669fbe6b427ba1f60f477',
  chains: [mainnet, polygon, optimism, arbitrum, base,bscTestnet,bsc],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();


// Mainnet-beta is the actuall mainnet (as of writing)
const endpoint = clusterApiUrl('mainnet-beta');
console.log(endpoint);
const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=f0c11eb0-ccc8-4f5f-afb3-b11308f4e46e");
const wallets = [new PhantomWalletAdapter()];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  // const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="bg-whiten dark:bg-black">
      <ConnectionProvider endpoint={"https://mainnet.helius-rpc.com/?api-key=f0c11eb0-ccc8-4f5f-afb3-b11308f4e46e"}>
      <WalletProvider wallets={wallets} autoConnect={true}>
      <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
        <div className="bg-body4 relative">
          <img src="/bg.png" alt="" className=" w-full h-full absolute top-0 left-0 right-0" />
          <div className=" z-[2]">
          {loading ? <Loader /> : children}
        </div>
        </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
        </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}
