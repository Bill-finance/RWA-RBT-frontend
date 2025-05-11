import { Invoice } from "./invoice";
import { apiRequest } from "./request";

export interface InvoiceBatch {
  accepted_currency: string;
  created_at: string;
  id: string;
  invoice_count: number;
  payee: string;
  payer: string;
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
    }>("/rwa/batch/list"),

  detail: (batchId: string) => {
    const batchDetailPromise = apiRequest.get<{
      code: number;
      msg: string;
      data: Invoice[];
    }>(`/rwa/batch/detail?id=${batchId}`);

    const invoiceDetailPromise = apiRequest.get<{
      code: number;
      msg: string;
      data: Invoice[];
    }>(`/rwa/batch/invoices?id=${batchId}`);

    return Promise.all([batchDetailPromise, invoiceDetailPromise]);
  },
};
