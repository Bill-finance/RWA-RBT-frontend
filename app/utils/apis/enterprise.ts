import { apiRequest } from "./request";

interface EnterpriseCreateRequest {
  name: string;
  walletAddress: string;
}

interface EnterpriseUpdateRequest {
  name?: string;
  walletAddress?: string;
  status?: string;
  kycDetailsIpfsHash?: string;
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
    return apiRequest.get("/rwa/enterprise/list");
  },

  // 因为先测的删除，没测通，不过这个问题不大
  update: (id: string, data: EnterpriseUpdateRequest) => {
    return apiRequest.put(`/rwa/enterprise/${id}`, data);
  },
};
