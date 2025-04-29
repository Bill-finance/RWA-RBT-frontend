import { apiRequest } from "./request";

interface BindEnterpriseRequest {
  enterpriseAddress: string;
}

export const userApi = {
  bindEnterprise: (data: BindEnterpriseRequest) => {
    return apiRequest.post("/rwa/user/bind-enterprise", data);
  },
};
