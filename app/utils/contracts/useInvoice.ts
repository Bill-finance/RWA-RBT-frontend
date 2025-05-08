import { useContract } from "./useContract";
import { type InvoiceData } from "./contractABI";
import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect } from "react";

export const useInvoice = () => {
  const { contractAddress, contractAbi, address } = useContract();

  const useBatchCreateInvoices = () => {
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

    const batchCreateInvoices = async (invoices: InvoiceData[]) => {
      if (!contractAddress) {
        console.error("Contract address is not defined");
        return;
      }

      try {
        const provider = await window.ethereum;
        const currentChainId = await provider.request({
          method: "eth_chainId",
        });

        // Transform invoices to match contract format
        const transformedInvoices = invoices.map((invoice) => {
          const res = {
            invoiceNumber: invoice.invoice_number,
            payee: invoice.payee,
            payer: invoice.payer,
            amount: BigInt(invoice.amount),
            ipfsHash: invoice.ipfs_hash,
            contractHash: invoice.contract_hash || "",
            timestamp: BigInt(invoice.timestamp),
            dueDate: BigInt(invoice.due_date),
            tokenBatch: invoice.token_batch || "",
            isCleared: Boolean(invoice.is_cleared),
            isValid: Boolean(invoice.is_valid),
          };

          console.log("res????", res);

          return res;
        });

        console.log("Chain and contract info:", {
          chainId: currentChainId,
          contractAddress,
          invoicesCount: invoices.length,
          transformedInvoices: transformedInvoices.map((inv) => ({
            ...inv,
            amount: inv.amount.toString(),
            timestamp: inv.timestamp.toString(),
            dueDate: inv.dueDate.toString(),
          })),
        });

        // // Validate invoice data before submission
        for (const invoice of invoices) {
          if (!invoice.amount) {
            throw new Error("Invoice amount is required");
          }
          if (!invoice.invoice_number) {
            throw new Error("Invoice number is required");
          }
          if (!invoice.payer) {
            throw new Error("Payer address is required");
          }
        }

        const params = {
          abi: contractAbi,
          address: contractAddress as `0x${string}`,
          functionName: "batchCreateInvoices",
          args: [transformedInvoices],
        };

        // Add detailed logging
        console.log("Transformed invoices detail:", transformedInvoices);

        console.log("Submitting transaction with data:", {
          address: contractAddress,
          functionName: "batchCreateInvoices",
          args: [transformedInvoices],
        });

        const result = await writeContract(params);

        console.log("Transaction hash:", result);
        return result;
      } catch (err: unknown) {
        // Enhanced MetaMask error handling
        if (typeof err === "object" && err !== null) {
          const error = err as {
            code?: number;
            message?: string;
            data?: unknown;
            name?: string;
            reason?: string;
            transaction?: {
              from?: string;
              to?: string;
              value?: string;
              gas?: string;
            };
          };

          console.error("❌ Transaction failed:", {
            code: error.code,
            message: error.message,
            name: error.name,
            reason: error.reason,
            transaction: error.transaction,
            // MetaMask specific error codes
            errorType:
              error.code === 4001
                ? "User rejected"
                : error.code === -32000
                ? "Insufficient funds"
                : error.code === -32603
                ? "Gas estimation failed"
                : "Unknown error",
            fullError: JSON.stringify(error, null, 2),
          });
        } else {
          console.error("❌ Unknown error:", err);
        }
        throw err;
      }
    };

    // Enhanced transaction status monitoring
    useEffect(() => {
      if (error) {
        // We can only detect pre-chain errors here (like user rejection or gas estimation)
        console.error("❌ Pre-chain error:", {
          name: error.name,
          message: error.message,
          details: error,
        });
      }

      if (hash) {
        // We can only confirm the transaction was submitted to the network
        console.log("📝 Transaction submitted to network:", {
          hash,
          contractAddress,
        });
      }

      if (receipt) {
        // We can see if the transaction was mined, but detailed failure reasons
        // require additional tools or contract events
        const status = receipt.status === "success";
        console.log(`Transaction mined ${status ? "✅" : "❌"}:`, {
          hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          status: receipt.status,
        });

        if (receipt.status !== "success") {
          console.log(
            "ℹ️ To see detailed failure reason, please check the transaction on block explorer"
          );
          // You could add a link to the block explorer here
          // const explorerUrl = `https://pharosscan.xyz/tx/`;
        }
      }
    }, [error, hash, contractAddress, receipt]);

    return {
      batchCreateInvoices,
      isPending,
      isSuccess,
      error,
      hash,
      receipt,
      isReceiptLoading,
    };
  };

  // 查询单个票据
  const useGetInvoice = (
    invoiceNumber?: string,
    checkValid: boolean = true,
    enabled: boolean = !!invoiceNumber
  ) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "getInvoice",
      args: invoiceNumber ? [invoiceNumber, checkValid] : undefined,
      query: {
        enabled: enabled && !!invoiceNumber,
      },
    });
  };

  // 查询用户票据列表
  const useGetUserInvoices = (
    userAddress?: `0x${string}`,
    enabled: boolean = !!userAddress
  ) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "getUserInvoices",
      args: userAddress ? [userAddress] : undefined,
      query: {
        enabled: enabled && !!userAddress,
      },
    });
  };

  // 查询当前用户票据列表
  const useGetCurrentUserInvoices = (enabled: boolean = !!address) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "getUserInvoices",
      args: address ? [address as `0x${string}`] : undefined,
      query: {
        enabled: enabled && !!address,
      },
    });
  };

  // 查询票据映射
  const useGetInvoiceMapping = (
    invoiceNumber?: string,
    enabled: boolean = !!invoiceNumber
  ) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "invoices",
      args: invoiceNumber ? [invoiceNumber] : undefined,
      query: {
        enabled: enabled && !!invoiceNumber,
      },
    });
  };

  // 批量查询票据
  const useBatchGetInvoices = (
    invoiceNumbers?: string[],
    enabled: boolean = !!invoiceNumbers?.length
  ) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "batchGetInvoices",
      args: invoiceNumbers ? [invoiceNumbers] : undefined,
      query: {
        enabled: enabled && !!invoiceNumbers?.length,
      },
    });
  };

  return {
    contractAddress: contractAddress as `0x${string}`,
    contractAbi,
    useBatchCreateInvoices,
    useGetInvoice,
    useGetUserInvoices,
    useGetCurrentUserInvoices,
    useGetInvoiceMapping,
    useBatchGetInvoices,
  };
};
