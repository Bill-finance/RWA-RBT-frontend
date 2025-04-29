import { useState, useCallback } from "react";
import { useInvoice } from "./useInvoice";
import type { InvoiceData } from "./contractABI";

export const useBatchInvoices = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { useGetCurrentUserInvoices } = useInvoice();

  // 获取当前用户的发票列表
  const { refetch: refetchUserInvoices } = useGetCurrentUserInvoices();

  // 转换合约数据到前端格式
  const transformInvoiceData = useCallback(
    (data: {
      invoiceNumber: string;
      payee: `0x${string}`;
      payer: `0x${string}`;
      amount: bigint;
      ipfsHash: string;
      timestamp: bigint;
      dueDate: bigint;
      isValid: boolean;
    }): InvoiceData => ({
      invoice_number: data.invoiceNumber,
      payee: data.payee,
      payer: data.payer,
      amount: data.amount.toString(),
      ipfs_hash: data.ipfsHash,
      contract_hash: "",
      timestamp: data.timestamp.toString(),
      due_date: data.dueDate.toString(),
      token_batch: "",
      is_cleared: false,
      is_valid: data.isValid,
    }),
    []
  );

  // 加载所有发票
  const loadAllInvoices = useCallback(async () => {
    console.log("Loading all invoices...");
    setIsLoading(true);
    setError(null);

    try {
      // 获取用户的所有票据编号
      const userInvoicesResult = await refetchUserInvoices();
      console.log("User invoices numbers:", userInvoicesResult.data);

      if (!userInvoicesResult.data) {
        return [];
      }

      // TODO: 这里我们需要一个新的合约方法 batchGetInvoices
      // 合约方法应该接收一个票据编号数组，返回对应的发票数据数组
      // 现在我们先返回空数组，等待合约更新
      console.warn("Contract method batchGetInvoices not implemented yet");
      return [];
    } catch (err) {
      console.error("Error loading all invoices:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load invoices")
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [refetchUserInvoices]);

  // 查看单个发票详情
  const getInvoiceDetails = useCallback(async (invoiceNumber: string) => {
    console.log("Viewing invoice details:", invoiceNumber);
    setError(null);

    try {
      // TODO: 这里我们需要一个新的合约方法 getInvoiceDetails
      // 合约方法应该接收一个票据编号，返回对应的发票数据
      // 现在我们先返回 null，等待合约更新
      console.warn("Contract method getInvoiceDetails not implemented yet");
      return null;
    } catch (err) {
      console.error("Error viewing invoice:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch invoice details")
      );
      return null;
    }
  }, []);

  return {
    loadAllInvoices,
    getInvoiceDetails,
    isLoading,
    error,
  };
};
