"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useSignMessage } from "wagmi";
import { authApi } from "../../utils/apis";
import { message } from "./Message";

interface AuthButtonProps {
  className?: string;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export default function AuthButton(props: AuthButtonProps) {
  const { className, isAuthenticated, setIsAuthenticated } = props;
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    setIsUserAuthenticated(isAuthenticated);
  }, [address]);

  const handleAuthenticate = async () => {
    if (!address) {
      message.error("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);

      message.loading(
        "Please sign the message in your wallet to verify your identity..."
      );

      try {
        // Get challenge
        const challengeRes = await authApi.generateChallenge({ address });

        if (!challengeRes || !challengeRes.data.nonce) {
          throw new Error("Failed to generate challenge");
        }

        const signature = await signMessageAsync({
          message: challengeRes.data.nonce,
          account: address,
        }).catch((error) => {
          console.error("Signature error:", error);
          throw new Error(`Failed to sign message: ${error.message}`);
        });

        if (!signature) {
          throw new Error("Failed to sign message");
        }

        // Login
        const loginRes = await authApi.login({
          requestId: challengeRes.data.requestId,
          signature,
        });

        if (loginRes && loginRes.data.token) {
          localStorage.setItem("token", loginRes.data.token);
          setIsAuthenticated(true);
          message.success("Authentication successful! You are now verified.");
        } else {
          throw new Error("Invalid login response");
        }
      } catch (e) {
        console.error("Detailed authentication error:", e);
        message.error(
          `Authentication failed: ${
            e instanceof Error ? e.message : "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Authentication error:", error);
      message.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
    return null;
  }

  if (!isUserAuthenticated) {
    return (
      <motion.button
        className={`px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-medium text-sm shadow-lg shadow-blue-500/20 flex items-center ${className}`}
        onClick={handleAuthenticate}
        disabled={isLoading}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Authenticating...
          </>
        ) : (
          <>
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15V17M6 7H18C19.1046 7 20 7.89543 20 9V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V9C4 7.89543 4.89543 7 6 7ZM16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7H16Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Verify Identity
          </>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-green-600/30 to-green-400/30 border border-green-500/50 text-green-300 font-medium text-sm ${className}`}
    >
      <motion.div
        className="w-2 h-2 rounded-full bg-green-500 mr-2"
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(74, 222, 128, 0)",
            "0 0 0 4px rgba(74, 222, 128, 0.2)",
            "0 0 0 0 rgba(74, 222, 128, 0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
      <span>Verified</span>
    </motion.div>
  );
}
