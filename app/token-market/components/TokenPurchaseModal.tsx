"use client";

import { Modal, Button, InputNumber, Form, Descriptions, Tag } from "antd";
import { useState } from "react";
import { TokenMarketData } from "../../utils/apis/token";
import { useTokenPurchase } from "@/app/utils/contracts/useTokenPurchase";
import { message } from "@/app/components/Message";
import { useContract } from "@/app/utils/contracts/useContract";
import { parseUnits } from "viem";

interface Props {
  open: boolean;
  token: TokenMarketData | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TokenPurchaseModal({
  open,
  token,
  onClose,
  onSuccess,
}: Props) {
  const [amount, setAmount] = useState<number>(0);
  const [form] = Form.useForm();
  const { contractAddress } = useContract();

  const { purchaseWithNativeToken, isPending, isReceiptLoading, hash } =
    useTokenPurchase();

  console.log("TokenPurchaseModal props:", {
    token,
    contractAddress,
  });

  const handleConfirm = async () => {
    if (!token || amount <= 0) return;

    try {
      // 获取原始批次ID
      const batchId = token.batch_reference;

      const pricePerToken = 1; // 1 MNT 每代币
      const totalMNT = amount * pricePerToken;

      // 将 MNT 数量转换为 wei 单位 (1 MNT = 10^18 wei)
      const valueInWei = parseUnits(totalMNT.toString(), 18);

      console.log("Purchase details:", {
        originalBatchId: batchId,
        amount: amount + " tokens",
        pricePerToken: pricePerToken + " MNT",
        totalPrice: totalMNT + " MNT",
        valueInWei: valueInWei.toString() + " wei",
      });

      await purchaseWithNativeToken(batchId, valueInWei);

      message.info(`Transaction submitted: ${hash}`);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Purchase error:", err);
      message.error(err?.message || "Transaction failed");
    }
  };

  return (
    <Modal
      title="Token Purchase"
      open={open}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          disabled={amount <= 0}
          loading={isPending || isReceiptLoading}
          onClick={handleConfirm}
        >
          Confirm Purchase
        </Button>,
      ]}
    >
      {token && (
        <>
          <Descriptions
            styles={{ label: { fontWeight: "bold" } }}
            bordered
            column={1}
            size="small"
            className="mb-6"
          >
            <Descriptions.Item label="Token Batch ID">
              {token.batch_reference}
            </Descriptions.Item>
            <Descriptions.Item label="Available Amount">
              <Tag color="blue">{token.available_token_amount} tokens</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              <Tag color="green">MNT (Native Token)</Tag>
            </Descriptions.Item>
          </Descriptions>

          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              label="Purchase Amount"
              extra="Please enter the number of tokens you wish to purchase"
            >
              <InputNumber
                min={1}
                max={Number(token.available_token_amount)}
                value={amount}
                onChange={(v) => setAmount(v || 0)}
                style={{ width: "100%" }}
                placeholder="Enter amount"
                size="large"
              />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}
