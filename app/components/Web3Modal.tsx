"use client";

import { ReactNode } from "react";
import { WagmiConfig, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { Chain } from "viem";

// Create a client
const queryClient = new QueryClient();

// Define custom chains if needed
const phaseTestnet: Chain = {
  id: 50002,
  name: "Pharos Devnet",
  nativeCurrency: {
    decimals: 18,
    name: "PHASE",
    symbol: "PHASE",
  },
  rpcUrls: {
    default: {
      http: ["https://devnet.dplabs-internal.com"],
      webSocket: ["wss://devnet.dplabs-internal.com"],
    },
    public: {
      http: ["https://devnet.dplabs-internal.com"],
      webSocket: ["wss://devnet.dplabs-internal.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "PharosScan",
      url: "https://pharosscan.xyz",
    },
  },
};

// Create wagmi config
const config = createConfig({
  chains: [mainnet, sepolia, phaseTestnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [phaseTestnet.id]: http(process.env.NEXT_PUBLIC_PHASE_RPC_URL),
  },
});

interface Web3ModalProps {
  children: ReactNode;
}

export function Web3Modal({ children }: Web3ModalProps) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
