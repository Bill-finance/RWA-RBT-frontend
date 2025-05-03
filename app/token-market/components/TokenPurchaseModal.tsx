"use client";

import { Modal, Button, Typography, InputNumber, Form, message } from "antd";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { TokenInfo } from "../types";

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  token: TokenInfo | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// 替换成你自己的合约地址和 ABI
const CONTRACT_ADDRESS = "0xYourContractAddress";
const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "tokenBatch", type: "string" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "purchase",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

export default function TokenPurchaseModal({
  open,
  token,
  onClose,
  onSuccess,
}: Props) {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const { writeContractAsync } = useWriteContract();

  const handleConfirm = async () => {
    if (!token || amount <= 0) return;

    try {
      setLoading(true);
      const txHash = await writeContractAsync({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "purchase",
        args: [token.token_batch, BigInt(amount)],
      });

      message.success(`Tx sent: ${txHash}`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      message.error(err?.shortMessage || err?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Purchase Token"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          disabled={amount <= 0}
          loading={loading}
          onClick={handleConfirm}
        >
          Confirm Purchase
        </Button>,
      ]}
    >
      {token && (
        <>
          <Title level={5}>Purchase Info</Title>
          <Text>Token Batch: {token.token_batch}</Text>
          <br />
          <Text>Available: {token.available}</Text>
          <br />
          <Text>Stablecoin: {token.stablecoin}</Text>

          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item label="Purchase Amount">
              <InputNumber
                min={1}
                max={token.available}
                value={amount}
                onChange={(v) => setAmount(v || 0)}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}
