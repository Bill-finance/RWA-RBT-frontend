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
  create: (data: EnterpriseCreateRequest) => {
    return apiRequest.post("/rwa/enterprise/create", data);
  },

  delete: (id: string) => {
    return apiRequest.delete(`/rwa/enterprise/del?id=${id}`);
  },

  getById: (id: string) => {
    return apiRequest.get(`/rwa/enterprise/detail?id=${id}`);
  },

  list: () => {
    return apiRequest.get("/rwa/enterprise/list");
  },

  update: (id: string, data: EnterpriseUpdateRequest) => {
    return apiRequest.put(`/rwa/enterprise/${id}`, data);
  },
};
