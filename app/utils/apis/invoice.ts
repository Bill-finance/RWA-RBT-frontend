import { apiRequest } from "./request";

export const invoiceApi = {
  create: (data: any) => {
    return apiRequest.post("/rwa/invoice/create", data);
  },

  list: () => {
    return apiRequest.get("/rwa/invoice/list");
  },

  delete: (id: string) => {
    return apiRequest.delete(`/rwa/invoice/del?id=${id}`);
  },

  getMyInvoices: () => {
    return apiRequest.get("/rwa/invoice/my");
  },

  query: (invoiceNumber: string) => {
    return apiRequest.get(`/rwa/invoice/query?invoice_number=${invoiceNumber}`);
  },
};
