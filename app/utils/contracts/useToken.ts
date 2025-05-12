import { useCallback } from "react";
import { useWriteContract } from "wagmi";
import { getTokenABI } from "./abis";

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

    const createToken = useCallback(
      async (
        tokenId: string,
        batchId: string,
        amount: string,
        maturityDate: string,
        interestRate: string
      ) => {
        try {
          const tokenABI = getTokenABI();
          const address = process.env
            .NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as `0x${string}`;

          await writeContractAsync({
            address,
            abi: tokenABI,
            functionName: "createToken",
            args: [tokenId, batchId, amount, maturityDate, interestRate],
          });
        } catch (error) {
          console.error("Error creating token:", error);
          throw error;
        }
      },
      [writeContractAsync]
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
