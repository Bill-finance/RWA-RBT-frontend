import { Invoice } from "./invoice";
import { apiRequest } from "./request";

export interface InvoiceBatch {
  accepted_currency: string;
  created_at: string;
  creditor_name: string;
  debtor_name: string;
  id: string;
  invoice_count: number;
  status: string;
  token_batch_id: string;
  total_amount: number;
}

export const invoiceBatchApi = {
  list: () =>
    apiRequest.get<{
      code: number;
      msg: string;
      data: InvoiceBatch[];
    }>("/rwa/invoice/batches"),

  detail: (batchId: number) => {
    const batchDetailPromise = apiRequest.get<{
      code: number;
      msg: string;
      data: Invoice[];
    }>(`/rwa/invoice/batch/${batchId}`);

    const invoiceDetailPromise = apiRequest.get<{
      code: number;
      msg: string;
      data: Invoice[];
    }>(`/rwa/invoice/batch/${batchId}/invoices`);

    return Promise.all([batchDetailPromise, invoiceDetailPromise]);
  },
};
