import { useEffect } from "react";
import { useContract } from "./useContract";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

export const usePurchase = () => {
  const { contractAddress, contractAbi } = useContract();

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

      const result = await writeContract({
        abi: contractAbi,
        address: contractAddress as `0x${string}`,
        functionName: "purchaseShares",
        args: [tokenBatch, amount],
      });

      console.log("Purchase tx hash:", result);
      return result;
    } catch (err: any) {
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
