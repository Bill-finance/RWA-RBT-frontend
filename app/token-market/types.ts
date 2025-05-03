export interface TokenInfo {
  token_batch: string;
  creditor: string;
  debtor: string;
  stablecoin: string;
  ticket_quantity: number;
  total_issued_amount: bigint;
  debtor_signed: boolean;
  created_at: string;
  wallet_created: string;
  updated_at: string;
  available: number;
  sold_amount: number;
  repaid_amount: number;
  valid_amount: number;
}
