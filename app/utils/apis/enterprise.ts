import { apiRequest } from "./request";

interface EnterpriseCreateRequest {
  name: string;
  walletAddress: string;
}

export interface Enterprise {
  created_at: string;
  id: string;
  kyc_details_ipfs_hash: string;
  name: string;
  status: string;
  updated_at: string;
  wallet_address: string;
}

export const enterpriseApi = {
  // ✅
  // 目前看起来一个钱包似乎只能有一个企业，测试不太好测
  create: (data: EnterpriseCreateRequest) => {
    return apiRequest.post("/rwa/enterprise/create", data);
  },

  // ✅
  delete: (id: string) => {
    return apiRequest.delete(`/rwa/enterprise/del?id=${id}`);
  },
  // ✅
  getById: (id: string) => {
    return apiRequest.get(`/rwa/enterprise/detail?id=${id}`);
  },

  // ✅
  list: () => {
    return apiRequest.get<{
      code: number;
      data: Enterprise[];
      msg: string;
    }>("/rwa/enterprise/list");
  },

  // // 因为先测的删除，没测通，不过这个问题不大
  // update: (id: string, data: EnterpriseUpdateRequest) => {
  //   return apiRequest.put(`/rwa/enterprise/${id}`, data);
  // },
};
