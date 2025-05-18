import { useCB, useContract } from "./common/useContract";
import { BaseContractProps, type InvoiceData } from "./common/contractABI";
import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  useChainId,
  useConfig,
} from "wagmi";

export const useInvoice = () => {
  const { contractAddress, contractAbi, address } = useContract();
  const chainId = useChainId();
  const config = useConfig();
  const currentChain = config.chains?.find((chain) => chain.id === chainId);

  /** ✅ 债权人创建票据 */
  const useBatchCreateInvoices = (props: BaseContractProps) => {
    const { onSuccess, onError, onLoading } = props;
    const {
      writeContract,
      error: writeContractError,
      data: hash,
      isPending: isWritePending,
    } = useWriteContract();
    const {
      isSuccess,
      data,
      error: waitForTransactionReceiptError,
      isPending: isReceiptPending,
    } = useWaitForTransactionReceipt({
      hash,
    });

    const batchCreateInvoices = async (invoices: InvoiceData[]) => {
      if (!contractAddress) {
        console.error("Contract address is not defined");
        return;
      }

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
        chain: currentChain,
        account: address as `0x${string}`,
      };

      // 震惊，如果不加 await，此后的 error 不会被捕获
      await writeContract(params);
    };

    useCB({
      isSuccess,
      isLoading: isWritePending || isReceiptPending,
      hash,
      data,
      error: writeContractError || waitForTransactionReceiptError,
      onSuccess,
      onError,
      onLoading,
    });

    return {
      batchCreateInvoices,
    };
  };

  /** ✅ 债权人申请创建 TOkEN（打包创建票据批次） */
  const useCreateTokenBatch = (props: BaseContractProps) => {
    const { onSuccess, onError, onLoading } = props;
    const {
      writeContract,
      error,
      data: hash,
      isPending: isWritePending,
    } = useWriteContract();
    const {
      data,
      isSuccess,
      isPending: isReceiptPending,
    } = useWaitForTransactionReceipt({
      hash,
    });

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
          chain: currentChain,
        };

        await writeContract(params);
      } catch (err) {
        console.error("Failed to create token batch:", err);
        throw err;
      }
    };

    useCB({
      isSuccess,
      isLoading: isWritePending || isReceiptPending,
      hash,
      data,
      error,
      onSuccess,
      onError,
      onLoading,
    });

    return {
      createTokenBatch,
    };
  };

  /** 债务人确认票据批次 */
  const useConfirmTokenBatchIssue = (props: BaseContractProps) => {
    const { onSuccess, onError } = props;
    const {
      writeContract,
      isPending: isWritePending,
      isSuccess,
      error,
      data: hash,
    } = useWriteContract();
    const { data, isLoading: isReceiptLoading } = useWaitForTransactionReceipt({
      hash,
    });

    const confirmTokenBatchIssue = async (batchId: string) => {
      if (!contractAddress) {
        console.error("Contract address is not defined");
        return;
      }

      const params = {
        abi: contractAbi,
        address: contractAddress as `0x${string}`,
        functionName: "confirmTokenBatchIssue",
        args: [batchId],
        account: address as `0x${string}`,
        chain: currentChain,
      };

      await writeContract(params);
    };

    useCB({
      isSuccess,
      isLoading: isWritePending || isReceiptLoading,
      hash,
      data,
      error,
      onSuccess,
      onError,
    });

    return {
      confirmTokenBatchIssue,
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
