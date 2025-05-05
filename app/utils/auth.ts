// app/utils/auth.ts 的修改版本
import { useSignMessage } from "wagmi";
import { authApi } from "./apis/auth";

interface AuthData {
  token: string;
  walletAddress: string;
}

/**
 * Handles the complete wallet authentication flow
 * 1. Generates a challenge from the backend
 * 2. Signs the challenge using the wallet
 * 3. Sends the signature to verify and get a token
 */
export async function authenticateWallet(
  address: string,
  signMessage: ReturnType<typeof useSignMessage>["signMessageAsync"]
): Promise<AuthData | null> {
  try {
    // Step 1: Generate challenge
    const challengeResponse = await authApi.generateChallenge({ address });

    if (
      !challengeResponse ||
      !challengeResponse.nonce ||
      !challengeResponse.requestId
    ) {
      console.error("Invalid challenge response:", challengeResponse);
      return null;
    }

    // Step 2: Sign the challenge with wallet
    // 这里直接传入字符串而不是对象
    const signature = await signMessage({
      message: challengeResponse.nonce,
    });

    if (!signature) {
      console.error("Failed to sign message");
      return null;
    }

    // Step 3: Verify signature and login
    const loginResponse = await authApi.login({
      requestId: challengeResponse.requestId,
      signature,
    });

    if (!loginResponse || !loginResponse.token) {
      console.error("Invalid login response:", loginResponse);
      return null;
    }

    // Store token in localStorage for subsequent API calls
    localStorage.setItem("token", loginResponse.token);

    return {
      token: loginResponse.token,
      walletAddress: loginResponse.walletAddress,
    };
  } catch (error) {
    console.error("Authentication failed:", error);
    return null;
  }
}

/**
 * Logs out the user by removing the token from localStorage
 */
export function logout(): void {
  localStorage.removeItem("token");
}

/**
 * Checks if the user is authenticated by checking for a token in localStorage
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token");
}

/**
 * Gets the current authentication token
 */
export function getToken(): string | null {
  return localStorage.getItem("token");
}
