import { apiRequest } from "./request";

export interface TransactionRecord {
  amount: string;
  holding_id: string;
  id: string;
  invoice_id: string;
  status: string;
  transaction_date: string;
  transaction_type: string;
  user_id: string;
}

export const transactionApi = {
  // Get all available tokens in the market
  list: () => {
    return apiRequest.get<{
      code: number;
      data: TransactionRecord[];
      msg: string;
    }>("/rwa/transaction/list");
  },

  // Get transactions by type
  listByType: (type: string) => {
    return apiRequest.get<{
      code: number;
      data: TransactionRecord[];
      msg: string;
    }>(`/rwa/transaction/by-type?transaction_type=${type}`);
  },

  // Get token details by batch number
  listByHolding: (holdingId: string) => {
    return apiRequest.get<{
      code: number;
      data: TransactionRecord[];
      msg: string;
    }>(`/rwa/transaction/by-holding?holding_id=${holdingId}`);
  },
};
