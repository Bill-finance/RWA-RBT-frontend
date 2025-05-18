import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { BaseContractProps, CONTRACT_ABI } from "./contractABI";
import { useEffect, useRef } from "react";
import { message } from "@/app/components/ui/Message";

if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
  throw new Error(
    "NEXT_PUBLIC_CONTRACT_ADDRESS is not defined in environment variables"
  );
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const useContract = () => {
  const { address } = useAccount();

  return {
    address,
    useReadContract,
    useWriteContract,
    contractAddress: CONTRACT_ADDRESS,
    contractAbi: CONTRACT_ABI,
    parseEther,
  };
};

interface UseCBProps<T> extends BaseContractProps {
  isSuccess: boolean;
  isLoading: boolean;
  hash: string;
  data: T;
  error: Error;
}

export const useCB = <T>({
  isSuccess,
  isLoading,
  hash,
  data,
  error,
  onSuccess,
  onError,
  onLoading,
}: UseCBProps<T>) => {
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onLoadingRef = useRef(onLoading);
  useEffect(() => {
    if (isSuccess && hash && onSuccessRef.current) {
      onSuccessRef.current({ data, hash, status: "success" });
    }
  }, [isSuccess, hash, data]);

  useEffect(() => {
    if (error && onErrorRef.current) {
      message.error(`${error}`.slice(0, 48));
      onErrorRef.current(error);
    }
  }, [error]);

  useEffect(() => {
    if (onLoadingRef.current) {
      onLoadingRef.current(isLoading);
    }
  }, [isLoading]);
};
