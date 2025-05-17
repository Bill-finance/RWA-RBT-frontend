import { useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

type UseContractCallOptions = {
  address: `0x${string}`;
  abi: any[];
  functionName: string;
  args: any[];
  onSuccess?: (data: any) => void;
};

export function useContractCall(options: UseContractCallOptions) {
  const { address, abi, functionName, args, onSuccess } = options;
  // 写入合约交易
  const { writeContract, data: txHash } = useWriteContract();
  // 监听交易结果
  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // 保存参数的 Ref，避免闭包问题
  const argsRef = useRef(args);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    argsRef.current = args;
    onSuccessRef.current = onSuccess;
  }, [args, onSuccess]);

  // 发起合约调用
  const sendContractCall = async () => {
    try {
      await writeContract({
        address: address,
        abi,
        functionName,
        args: argsRef.current,
      });
    } catch (error) {
      console.error("Contract call failed:", error);
      throw error;
    }
  };

  // 监听交易成功并触发后续逻辑
  useEffect(() => {
    if (isTxSuccess && txHash && onSuccessRef.current) {
      onSuccessRef.current({ hash: txHash, status: "success" });
    }
  }, [isTxSuccess, txHash]);

  return {
    sendContractCall,
    isPending: !!txHash && !isTxSuccess,
    isSuccess: isTxSuccess,
    txHash,
  };
}
