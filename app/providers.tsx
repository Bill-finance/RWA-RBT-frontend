"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { Chain } from "viem";

const queryClient = new QueryClient();

// Define the PHASE testnet chain
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

const mantleSepoliaTestNet: Chain = {
  id: 5003,
  name: "Mantle Sepolia Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MNT",
    symbol: "MNT",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.mantle.xyz"],
      webSocket: ["wss://ws.sepolia.mantle.xyz"],
    },
  },
};

const config = createConfig({
  chains: [mainnet, sepolia, phaseTestnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [phaseTestnet.id]: http(process.env.NEXT_PUBLIC_PHASE_RPC_URL),
    [mantleSepoliaTestNet.id]: http(
      process.env.NEXT_PUBLIC_MANTLE_SEPOLIA_RPC_URL
    ),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
