import { apiRequest } from "./request";

export interface CreateInvoiceRequest {
  payee: string;
  payer: string;
  amount: number;
  invoice_ipfs_hash: string;
  contract_ipfs_hash: string;
  due_date: string;
  currency: string;
}

export interface Invoice {
  amount: 0;
  blockchain_timestamp: "string";
  contract_ipfs_hash: "string";
  created_at: "2025-05-05T17:29:52.360Z";
  currency: "string";
  due_date: 9007199254740991;
  id: "string";
  invoice_ipfs_hash: "string";
  invoice_number: "string";
  is_cleared: true;
  is_valid: true;
  payee: "string";
  payer: "string";
  status: "PENDING" | "VERIFIED" | "ISSUED" | "UNISSUED" | "COMPLETED";
  token_batch: "string";
  updated_at: string;
}

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

// 票据状态：待上链->已上链->在售

export const invoiceApi = {
  // 创建
  create: (data: CreateInvoiceRequest) => {
    return apiRequest.post("/rwa/invoice/create", data);
  },
  // 上链
  verify: (id: string) => {
    return apiRequest.post(`/rwa/invoice/verify`, { id: id });
  },
  // 发布（在售）
  issue: (ids: string[]) => {
    return apiRequest.post(`/rwa/invoice/issue`, { invoice_ids: ids });
  },
  // TODO: 下架
  // unissue: (ids: string[]) => {
  //   return apiRequest.post(`/rwa/invoice/unissue`, { invoice_ids: ids });
  // },

  // 所有票据
  list: () => {
    return apiRequest.get<{
      code: number;
      msg: string;
      data: Invoice[];
    }>("/rwa/invoice/list");
  },

  // 删除票据
  delete: (id: string, invoiceNumber: string) => {
    return apiRequest.delete(
      `/rwa/invoice/del?id=${id}&invoice_number=${invoiceNumber}`
    );
  },

  // 查看票据本身的详情（点击按钮后调用）
  detail: (invoiceNumber: string) => {
    return apiRequest.get<{
      code: number;
      msg: string;
      data: Invoice[];
    }>(`/rwa/invoice/detail?invoice_number=${invoiceNumber}`);
  },

  // 利息详情，通过持有人id查询？
  interestDetail: (holdingId: string) => {
    return apiRequest.get(
      `/rwa/invoice/interest_detail?holding_id=${holdingId}`
    );
  },
  // 收敛到 list 接口
  // getMyInvoices: () => {
  //   return apiRequest.get("/rwa/invoice/my");
  // },

  // query: (invoiceNumber: string) => {
  //   return apiRequest.get(`/rwa/invoice/query?invoice_number=${invoiceNumber}`);
  // },

  batch: {
    getDetailOfBatch: (batchId: string) => {
      return apiRequest.get(`/rwa/invoice/batch/${batchId}`);
    },

    getInvoicesInBatch: (batchId: string) => {
      return apiRequest.get<Invoice[]>(
        `/rwa/invoice/batch/${batchId}/invoices`
      );
    },

    getBatchOfCurrentUser: () => {
      return apiRequest.get<InvoiceBatch[]>("/rwa/invoice/batches");
    },
  },
};
