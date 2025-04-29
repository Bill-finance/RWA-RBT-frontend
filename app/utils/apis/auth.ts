import { apiRequest } from "./request";

interface ChallengeRequest {
  address: string;
}

interface ChallengeResponse {
  nonce: string;
  requestId: string;
}

interface LoginRequest {
  requestId: string;
  signature: string;
}

interface LoginResponse {
  token: string;
  walletAddress: string;
}

export const authApi = {
  // ✅
  generateChallenge: (data: ChallengeRequest) => {
    return apiRequest.post<ChallengeResponse>("/rwa/user/challenge", data);
  },

  // ✅
  login: (data: LoginRequest) => {
    return apiRequest.post<LoginResponse>("/rwa/user/login", data);
  },
};
