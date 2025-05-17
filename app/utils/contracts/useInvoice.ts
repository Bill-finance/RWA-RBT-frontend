import { useContract } from "./common/useContract";
import { type InvoiceData } from "./common/contractABI";
import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect, useRef } from "react";

export const useInvoice = () => {
  const { contractAddress, contractAbi, address } = useContract();

  const useBatchCreateInvoices = ({
    onSuccess,
  }: {
    onSuccess: <T>(data: T) => void;
  }) => {
    const {
      writeContract,
      error: writeContractError,
      data: hash,
    } = useWriteContract();
    const {
      isSuccess,
      data,
      error: waitForTransactionReceiptError,
    } = useWaitForTransactionReceipt({
      hash,
    });

    const onSuccessRef = useRef(onSuccess);

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

          return res;
        });

        const params = {
          abi: contractAbi,
          address: contractAddress as `0x${string}`,
          functionName: "batchCreateInvoices",
          args: [transformedInvoices],
          chain: undefined,
          account: address as `0x${string}`,
        };

        const result = await writeContract(params);

        return result;
      } catch (err: unknown) {
        throw err;
      }
    };

    useEffect(() => {
      if (isSuccess && hash && onSuccessRef.current) {
        onSuccessRef.current({ data, hash, status: "success" });
      }
    }, [isSuccess, hash, data]);

    return {
      batchCreateInvoices,
      isSuccess,
      error: writeContractError || waitForTransactionReceiptError,
      hash,
      data,
    };
  };

  const useCreateTokenBatch = ({
    onSuccess,
  }: {
    onSuccess: <T>(data: T) => void;
  }) => {
    const { writeContract, error, data: hash } = useWriteContract();
    const { data, isSuccess } = useWaitForTransactionReceipt({
      hash: hash,
    });

    const onSuccessRef = useRef(onSuccess);

    const createTokenBatch = async (
      batchId: string,
      invoiceNumbers: string[],
      stableToken: string,
      minTerm: number,
      maxTerm: number,
      interestRate: number
    ) => {
      if (!contractAddress) {
        console.error("Contract address is not defined");
        return;
      }

      try {
        const params = {
          abi: contractAbi,
          address: contractAddress as `0x${string}`,
          functionName: "createTokenBatch",
          args: [
            batchId,
            invoiceNumbers,
            stableToken,
            BigInt(minTerm),
            BigInt(maxTerm),
            BigInt(interestRate),
          ],
          account: address as `0x${string}`,
          chain: undefined,
        };

        await writeContract(params);
      } catch (err) {
        console.error("Failed to create token batch:", err);
        throw err;
      }
    };

    useEffect(() => {
      if (isSuccess && hash && onSuccessRef.current) {
        onSuccessRef.current({ data, hash, status: "success" });
      }
    }, [isSuccess, hash, data]);

    return {
      createTokenBatch,
      isSuccess,
      error,
      hash,
      data,
    };
  };

  // Confirm token batch issue hook
  const useConfirmTokenBatchIssue = () => {
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

    const confirmTokenBatchIssue = async (batchId: string) => {
      if (!contractAddress) {
        console.error("Contract address is not defined");
        return;
      }

      try {
        const params = {
          abi: contractAbi,
          address: contractAddress as `0x${string}`,
          functionName: "confirmTokenBatchIssue",
          args: [batchId],
          account: address as `0x${string}`,
          chain: undefined,
        };

        console.log("Confirming token batch issue with params:", {
          batchId,
        });

        const result = await writeContract(params);
        console.log("Transaction hash:", result);
        return result;
      } catch (err) {
        console.error("Failed to confirm token batch issue:", err);
        throw err;
      }
    };

    return {
      confirmTokenBatchIssue,
      isPending,
      isSuccess,
      error,
      hash,
      receipt,
      isReceiptLoading,
    };
  };

  // Get token batch details hook
  const useGetTokenBatch = (batchId?: string, enabled: boolean = !!batchId) => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "getTokenBatch",
      args: batchId ? [batchId] : undefined,
      query: {
        enabled: enabled && !!batchId,
      },
    });
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
    useCreateTokenBatch,
    useConfirmTokenBatchIssue,
    useGetTokenBatch,
    useGetInvoice,
    useGetUserInvoices,
    useGetCurrentUserInvoices,
    useGetInvoiceMapping,
    useBatchGetInvoices,
  };
};
