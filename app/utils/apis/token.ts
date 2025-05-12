import { apiRequest } from "./request";

export interface TokenMarketData {
  available_token_amount: string;
  batch_reference: string;
  creditor_address: string;
  debtor_address: string;
  id: string;
  remaining_transaction_amount: string;
  sold_token_amount: string;
  stablecoin_symbol: string;
  token_value_per_unit: string;
  total_token_amount: string;
}

export interface UserHoldingTokenData {
  batch_reference: string;
  current_value: string;
  id: string;
  purchase_date: string;
  purchase_value: string;
  status: string;
  token_amount: string;
}

export interface TokenPurchaseRequest {
  batch_id: string;
  token_amount: string;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

export interface CreateTokenRequest {
  batch_id: string;
  interest_rate_apy: number;
  // 形如：9007199254740991
  maturity_date: number;
  token_value: number;
  total_token_supply: number;
}

export const tokenApi = {
  getTokenMarketList: (params?: {
    tokenType?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const queryParams = new URLSearchParams({
      page: String(params?.page || 1),
      page_size: String(params?.pageSize || 10),
      stablecoin_symbol: params?.tokenType || "USD", // TODO: 后续换成 ALL，目前先用 USD 兜底
      ...(params?.tokenType ? { tokenType: params.tokenType } : {}),
    });

    return apiRequest.get<ApiResponse<TokenMarketData[]>>(
      `/rwa/token/markets?${queryParams.toString()}`
    );
  },

  purchase: (data: TokenPurchaseRequest) => {
    return apiRequest.post<ApiResponse<{ holding_id: string }>>(
      "/rwa/token/purchase",
      data
    );
  },

  /** 查询当前用户持有的代币 */
  getHolding: () => {
    return apiRequest.get<ApiResponse<UserHoldingTokenData[]>>(
      "/rwa/token/holdings"
    );
  },
  /** 创建代币批次——从票据批次创建
   * !只有管理员 or 债权人才能创建 */
  createToken: (params: CreateTokenRequest) => {
    return apiRequest.post<{
      code: number;
      msg: string;
      data: unknown;
    }>(`/rwa/token/create`, {
      ...params,
    });
  },
};
