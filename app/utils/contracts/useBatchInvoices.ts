import { useState, useCallback } from "react";
import { useInvoice } from "./useInvoice";

export const useBatchInvoices = () => {
  const [error, setError] = useState<Error | null>(null);
  const { useGetCurrentUserInvoices } = useInvoice();
  const { refetch: refetchUserInvoices } = useGetCurrentUserInvoices();

  // 加载所有发票
  const loadAllInvoices = useCallback(async () => {
    setError(null);

    try {
      const userInvoicesResult = await refetchUserInvoices();
      if (!userInvoicesResult.data) {
        return [];
      }
      // TODO: ?
      return [];
    } catch (err) {
      console.error("Error loading all invoices:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to load invoices")
      );
      return [];
    }
  }, [refetchUserInvoices]);

  // 查看单个发票详情
  const getInvoiceDetails = useCallback(async (invoiceNumber: string) => {
    console.log("Viewing invoice details:", invoiceNumber);
    setError(null);

    try {
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
    error,
  };
};
