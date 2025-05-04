export interface EnterpriseResponse {
  id: string;
  name: string;
  wallet_address: string;
  status: string;
  kyc_details_ipfs_hash: string | null;
  created_at: {
    $date: {
      $numberLong: string;
    };
  };
  updated_at: {
    $date: {
      $numberLong: string;
    };
  };
}

export interface EnterpriseListResponse {
  code: number;
  data: EnterpriseResponse[];
  msg: string;
}
