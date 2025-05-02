import { apiRequest } from "./request";

export interface TokenMarketData {
  id: string;
  token_batch: string;
  creditor_name: string;
  creditor_address: string;
  debtor_name: string;
  debtor_address: string;
  stablecoin: string;
  total_amount: number;
  available_amount: number;
  sold_amount: number;
  interest_rate: number;
  maturity_date: string;
  risk_rating: number;
  status: "active" | "fully_sold" | "expired";
}

export interface TokenPurchaseRequest {
  token_batch: string;
  amount: number;
  buyer_address: string;
}

export const tokenApi = {
  // Get all available tokens in the market
  list: () => {
    return apiRequest.get<{
      code: number;
      data: TokenMarketData[];
      msg: string;
    }>("/rwa/token/market");
  },

  // Purchase tokens
  purchase: (data: TokenPurchaseRequest) => {
    return apiRequest.post<{ code: number; data: any; msg: string }>(
      "/rwa/token/purchase",
      data
    );
  },

  // Get token details by batch number
  getByBatch: (batchNumber: string) => {
    return apiRequest.get<{ code: number; data: TokenMarketData; msg: string }>(
      `/rwa/token/detail?batch=${batchNumber}`
    );
  },

  // Get my purchased tokens
  getMyTokens: () => {
    return apiRequest.get<{
      code: number;
      data: TokenMarketData[];
      msg: string;
    }>("/rwa/token/my");
  },
};
