import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ABI } from "./contractABI";

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
