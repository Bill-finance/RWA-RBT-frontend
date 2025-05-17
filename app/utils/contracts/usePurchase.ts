import { useEffect } from "react";
import { useContract } from "./common/useContract";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useConfig,
} from "wagmi";

export const usePurchase = () => {
  const { contractAddress, contractAbi, address } = useContract();
  const chainId = useChainId();
  const config = useConfig();

  // Get the current chain object from config
  const currentChain = config.chains?.find((chain) => chain.id === chainId);

  const {
    writeContract,
    isPending,
    isSuccess,
    error,
    data: hash,
  } = useWriteContract();

  const { data: receipt, isLoading: isReceiptLoading } =
    useWaitForTransactionReceipt({
      hash: hash as `0x${string}`,
    });

  const purchase = async (tokenBatch: string, amount: bigint) => {
    if (!contractAddress) {
      console.error("Contract address is not defined");
      return;
    }

    try {
      console.log("Submitting purchase transaction", {
        contractAddress,
        tokenBatch,
        amount: amount.toString(),
      });

      await writeContract({
        abi: contractAbi,
        address: contractAddress as `0x${string}`,
        functionName: "purchaseShares",
        args: [tokenBatch, amount],
        chain: currentChain,
        account: address as `0x${string}`,
      });
    } catch (err) {
      console.error("❌ Purchase transaction failed:", err);
      throw err;
    }
  };

  useEffect(() => {
    if (error) {
      console.error("❌ Pre-chain error (purchase):", error);
    }

    if (hash) {
      console.log("📝 Purchase transaction submitted:", hash);
    }

    if (receipt) {
      const success = receipt.status === "success";
      console.log(`Purchase mined ${success ? "✅" : "❌"}:`, receipt);
    }
  }, [error, hash, receipt]);

  return {
    purchase,
    isPending,
    isSuccess,
    error,
    hash,
    receipt,
    isReceiptLoading,
  };
};
