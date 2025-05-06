"use client";

import { Modal, Button, Typography, InputNumber, Form, App } from "antd";
import { useState } from "react";
import { UserHoldingTokenData } from "../../utils/apis/token";
import { usePurchase } from "@/app/utils/contracts/usePurchase";

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  token: UserHoldingTokenData | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TokenRepurchaseModal({
  open,
  token,
  onClose,
  onSuccess,
}: Props) {
  const { purchase } = usePurchase();
  const { message } = App.useApp();
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleConfirm = async () => {
    if (!token || amount <= 0) return;

    try {
      setLoading(true);
      const txHash = await purchase(token.batch_reference, BigInt(amount));

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
      title="Repurchase Token"
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
          <Text>Token Batch: {token.batch_reference}</Text>
          <br />
          <Text>Current Value: {token.current_value}</Text>
          <br />
          <Text>Status: {token.status}</Text>

          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item label="Purchase Amount">
              <InputNumber
                min={1}
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
