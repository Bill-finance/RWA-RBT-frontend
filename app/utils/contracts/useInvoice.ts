import { useContract } from "./useContract";
import { type InvoiceData } from "./contractABI";
import { useWriteContract, useReadContract } from "wagmi";

export const useInvoice = () => {
  const { contractAddress, contractAbi, address } = useContract();

  // 批量创建票据
  const useBatchCreateInvoices = () => {
    const { writeContract, isPending, isSuccess, error, data } =
      useWriteContract();

    const batchCreateInvoices = (invoices: InvoiceData[]) => {
      if (!contractAddress) return;

      // Using any for the invoices argument due to complex typing constraints
      // between InvoiceData and the ABI's expectation
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: contractAbi,
        functionName: "batchCreateInvoices",
        args: [invoices as any], // eslint-disable-line @typescript-eslint/no-explicit-any
      });
    };

    return {
      batchCreateInvoices,
      isPending,
      isSuccess,
      error,
      data,
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

  return {
    contractAddress: contractAddress as `0x${string}`,
    contractAbi,
    useBatchCreateInvoices,
    useGetInvoice,
    useGetUserInvoices,
    useGetCurrentUserInvoices,
    useGetInvoiceMapping,
  };
};
