import { useContract } from "./useContract";
import { type InvoiceData } from "./contractABI";
import {
  type UseWriteContractReturnType,
  type UseReadContractReturnType,
} from "wagmi";

export const useInvoice = () => {
  const { contractAddress, contractAbi } = useContract();

  // 批量创建票据
  const batchCreateInvoices = (
    invoices: InvoiceData[]
  ): UseWriteContractReturnType => {
    return useWriteContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "batchCreateInvoices",
      args: [invoices],
    });
  };

  // 查询单个票据
  const getInvoice = (
    invoiceNumber: string,
    checkValid: boolean = true
  ): UseReadContractReturnType<InvoiceData> => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "getInvoice",
      args: [invoiceNumber, checkValid],
    });
  };

  // 查询用户票据列表
  const getUserInvoices = (
    userAddress: `0x${string}`
  ): UseReadContractReturnType<string[]> => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "getUserInvoices",
      args: [userAddress],
    });
  };

  // 查询票据映射
  const getInvoiceMapping = (
    invoiceNumber: string
  ): UseReadContractReturnType<InvoiceData> => {
    return useReadContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "invoices",
      args: [invoiceNumber],
    });
  };

  return {
    contractAddress: contractAddress as `0x${string}`,
    contractAbi,
    batchCreateInvoices,
    getInvoice,
    getUserInvoices,
    getInvoiceMapping,
  };
};
