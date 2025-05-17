import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useConfig,
} from "wagmi";
import { parseUnits } from "viem";
import { useContract } from "./common/useContract";

// ERC20 ABI for token operations
const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
] as const;

export const useTokenPurchase = (tokenAddress?: `0x${string}`) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const { contractAddress, contractAbi } = useContract();

  const currentChain = config.chains?.find((chain) => chain.id === chainId);

  console.log("Debug info:", {
    tokenAddress,
    userAddress: address,
    contractAddress,
    chainId,
    currentChain,
  });

  // Read token decimals
  const { data: decimalsFromContract, error: decimalsError } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  // Use contract decimals if available, otherwise fallback to 6 (common for stablecoins)
  const decimals =
    decimalsFromContract !== undefined ? Number(decimalsFromContract) : 6;

  console.log("Decimals info:", {
    fromContract: decimalsFromContract,
    error: decimalsError,
    using: decimals,
  });

  // Read user's token balance
  const { data: balance, error: balanceError } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  console.log("Balance info:", {
    tokenAddress,
    userAddress: address,
    balance,
    error: balanceError,
  });

  // Read token allowance
  const { data: allowance, error: allowanceError } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, contractAddress as `0x${string}`],
  });

  console.log("Allowance info:", {
    tokenAddress,
    userAddress: address,
    spender: contractAddress,
    allowance,
    error: allowanceError,
  });

  // Write contract for approvals and purchases
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Wait for transaction receipt
  const { data: receipt, isLoading: isReceiptLoading } =
    useWaitForTransactionReceipt({
      hash,
    });

  const approve = async (amount: bigint) => {
    if (!tokenAddress || !contractAddress || !address) {
      throw new Error(
        "Token address, contract address, or user address is not defined"
      );
    }

    if (!currentChain) {
      throw new Error(
        "Chain is not defined. Please make sure you are connected to a blockchain network."
      );
    }

    try {
      await writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [contractAddress, amount],
        account: address,
        chain: currentChain,
      });
    } catch (err) {
      console.error("Approval failed:", err);
      throw err;
    }
  };

  const purchase = async (tokenBatch: `0x${string}`, amount: bigint) => {
    if (!contractAddress || !address) {
      throw new Error("Contract address or user address is not defined");
    }

    if (!currentChain) {
      throw new Error(
        "Chain is not defined. Please make sure you are connected to a blockchain network."
      );
    }

    try {
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "purchaseShares",
        args: [tokenBatch, amount],
        account: address,
        chain: currentChain,
      });
    } catch (err) {
      console.error("Purchase failed:", err);
      throw err;
    }
  };

  // 原生代币购买函数 - 用于直接使用MNT购买
  const purchaseWithNativeToken = async (
    tokenBatch: string,
    value?: bigint
  ) => {
    if (!contractAddress || !address) {
      throw new Error("Contract address or user address is not defined");
    }

    if (!currentChain) {
      throw new Error(
        "Chain is not defined. Please make sure you are connected to a blockchain network."
      );
    }

    // Validate the batch ID
    if (!tokenBatch || tokenBatch.trim().length === 0) {
      throw new Error("Invalid batch ID - must be a non-empty string");
    }

    // Validate the value
    if (!value || value <= BigInt(0)) {
      throw new Error("Invalid purchase amount - must be greater than 0");
    }

    try {
      console.log("Purchasing with native token (MNT)", {
        tokenBatch,
        contractAddress,
        value: value ? value.toString() : undefined,
      });

      // 创建交易选项
      const txOptions = {
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "purchaseSharesWithNativeToken",
        args: [tokenBatch.trim()], // 确保去除任何可能的空格
        account: address,
        chain: currentChain,
      } as const;

      // 如果提供了value，添加到选项中
      const finalOptions = value ? { ...txOptions, value } : txOptions;

      console.log(
        "Final transaction options:",
        JSON.stringify(
          finalOptions,
          (_, v) => (typeof v === "bigint" ? v.toString() : v),
          2
        )
      );

      const txHash = await writeContract(finalOptions);
      console.log("Transaction submitted with hash:", txHash);
      return txHash;
    } catch (err) {
      // 尝试解析合约错误
      console.error("Native token purchase failed:", err);

      // 尝试提取更有用的错误信息
      let errorMessage = "Transaction failed";
      if (err instanceof Error) {
        errorMessage = err.message;

        // 尝试从错误消息中提取合约特定的错误
        if (errorMessage.includes("execution reverted")) {
          // 检查具体的合约错误类型
          if (errorMessage.includes("Invoice__BatchNotIssued")) {
            errorMessage =
              "The token batch has not been issued yet. Please check the batch status.";
          } else if (errorMessage.includes("Invoice__InsufficientBalance")) {
            errorMessage =
              "Insufficient tokens available in this batch. Please try a smaller amount.";
          } else if (errorMessage.includes("Invoice__InvalidAmount")) {
            errorMessage = "Invalid purchase amount provided.";
          } else if (errorMessage.includes("Invoice__TransferFailed")) {
            errorMessage = "Token transfer failed. Please contact support.";
          } else {
            // 通用回滚错误
            errorMessage =
              "Contract execution reverted: The transaction was rejected by the contract. Possible reasons: 1) Batch not issued 2) Batch sold out 3) Insufficient payment amount";
          }
        } else if (errorMessage.includes("user rejected")) {
          errorMessage = "Transaction rejected by user";
        }
      }

      throw new Error(errorMessage);
    }
  };

  const purchaseWithApproval = async (
    tokenBatch: `0x${string}`,
    amount: number
  ) => {
    // Safeguard against bad input or missing data
    if (!tokenAddress || !contractAddress || !address) {
      throw new Error(
        "Token address, contract address, or user address is not defined"
      );
    }

    const amountWithDecimals = parseUnits(amount.toString(), decimals);

    // If balance is undefined, we'll assume the user has enough tokens
    // This is risky, but allows for cases where checking balance fails
    // The transaction will still fail if the user doesn't have enough tokens
    if (balance === undefined) {
      console.warn("Could not read balance - proceeding with purchase anyway");
    } else {
      // Check balance if we have it
      const userBalance = BigInt(balance.toString());
      if (userBalance < amountWithDecimals) {
        throw new Error("Insufficient balance");
      }
    }

    // If allowance is undefined, we'll try to approve anyway
    // Some tokens might not properly implement the allowance method
    if (allowance === undefined) {
      console.warn(
        "Could not read allowance - proceeding with approval anyway"
      );
      try {
        await approve(amountWithDecimals);
      } catch (err) {
        console.error("Approval failed:", err);
        throw new Error(
          "Failed to approve token transfer. Please check your token and try again."
        );
      }
    } else {
      // Check allowance if we have it
      const currentAllowance = BigInt(allowance.toString());
      if (currentAllowance < amountWithDecimals) {
        // Need approval
        try {
          await approve(amountWithDecimals);
        } catch (err) {
          console.error("Approval failed:", err);
          throw new Error(
            "Failed to approve token transfer. Please check your token and try again."
          );
        }
      }
    }

    // Proceed with purchase
    try {
      await purchase(tokenBatch, amountWithDecimals);
    } catch (err) {
      console.error("Purchase failed:", err);
      throw new Error("Failed to complete purchase. Please try again.");
    }
  };

  return {
    purchaseWithApproval,
    purchaseWithNativeToken,
    isPending,
    isReceiptLoading,
    error,
    hash,
    receipt,
    // Safe defaults if balance/allowance are undefined
    balance: balance === undefined ? undefined : BigInt(balance.toString()),
    allowance:
      allowance === undefined ? undefined : BigInt(allowance.toString()),
    decimals,
  };
};
