import { apiRequest } from "./request";

export interface Interest {
  accrual_date: string;
  calculated_at: string;
  daily_interest_amount: string;
  holding_id: string;
  id: string;
  invoice_id: string;
  user_id: string;
}

export const interestApi = {
  // 查询所有用户的所有日利息记录
  list: () => {
    return apiRequest.get<{
      code: number;
      data: Interest[];
      msg: string;
    }>("/rwa/interest/list");
  },
  // 查看特定持有人的利息
  getByHoldingId: (holdingId: string) => {
    return apiRequest.get<{
      code: number;
      data: Interest[];
      msg: string;
    }>(`/rwa/interest/by-holding-id?holding_id=${holdingId}`);
  },
};
