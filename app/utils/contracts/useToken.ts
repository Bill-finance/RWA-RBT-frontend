import { useCallback } from "react";
import { useWriteContract, useAccount, useChainId, useConfig } from "wagmi";
import { CONTRACT_ABI } from "./common/contractABI";

export const useToken = () => {
  // Hook for creating a token
  const useCreateToken = () => {
    const {
      writeContractAsync,
      isPending,
      isSuccess,
      error,
      data: hash,
    } = useWriteContract();
    const { address } = useAccount();
    const chainId = useChainId();
    const config = useConfig();

    // 获取当前连接的链
    const currentChain = config.chains?.find((chain) => chain.id === chainId);

    const createToken = useCallback(
      async (
        batchId: string,
        invoiceNumbers: readonly string[],
        stableToken: `0x${string}`,
        minTerm: string,
        maxTerm: string,
        interestRate: string
      ) => {
        try {
          const contractAddress = process.env
            .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

          if (!currentChain) {
            throw new Error("Chain not configured or not connected");
          }

          // 打印调试信息
          console.log("Creating token with params:", {
            batchId,
            invoiceNumbersCount: invoiceNumbers.length,
            stableToken,
            minTerm,
            maxTerm,
            interestRate,
            contractAddress,
            userAddress: address,
            chainId,
            currentChain: currentChain?.name,
          });

          // 验证参数
          if (
            !stableToken ||
            stableToken === "0x" ||
            !stableToken.startsWith("0x")
          ) {
            throw new Error(`Invalid stableToken address: ${stableToken}`);
          }

          // 确保所有数值参数都是整数
          const safeMinTerm = Math.floor(Number(minTerm)).toString();
          const safeMaxTerm = Math.floor(Number(maxTerm)).toString();
          const safeInterestRate = Math.floor(Number(interestRate)).toString();

          console.log("Sanitized numeric parameters:", {
            original: { minTerm, maxTerm, interestRate },
            sanitized: { safeMinTerm, safeMaxTerm, safeInterestRate },
          });

          await writeContractAsync({
            address: contractAddress,
            abi: CONTRACT_ABI,
            functionName: "createTokenBatch",
            args: [
              batchId,
              invoiceNumbers,
              stableToken,
              safeMinTerm,
              safeMaxTerm,
              safeInterestRate,
            ],
            account: address,
            chain: currentChain,
          });
        } catch (error) {
          console.error("Error creating token:", error);
          throw error;
        }
      },
      [writeContractAsync, address, currentChain, chainId]
    );

    return {
      createToken,
      isPending,
      isSuccess,
      error,
      hash,
    };
  };

  return {
    useCreateToken,
  };
};
