"use client";

import {
  Modal,
  Button,
  InputNumber,
  Form,
  Descriptions,
  Tag,
  Alert,
} from "antd";
import { useState, useEffect } from "react";
import { TokenMarketData } from "../../utils/apis/token";
import { useTokenPurchase } from "@/app/utils/contracts/useTokenPurchase";
import { message } from "@/app/components/ui/Message";
import { useContract } from "@/app/utils/contracts/common/useContract";
import { parseUnits } from "viem";
import { invoiceBatchApi } from "@/app/utils/apis/invoiceBatch";

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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { purchaseWithNativeToken, isPending, isReceiptLoading, hash } =
    useTokenPurchase();

  // Reset validation error when modal opens/closes or token changes
  useEffect(() => {
    setValidationError(null);
    setAmount(0);

    // 当modal打开时，验证批次状态
    if (open && token) {
      verifyBatchStatus(token.batch_reference);
    }
  }, [open, token]);

  console.log("TokenPurchaseModal props:", {
    token,
    contractAddress,
  });

  // 验证批次状态
  const verifyBatchStatus = async (batchId: string) => {
    if (!batchId) return;

    try {
      setIsVerifying(true);

      // 调用API获取批次状态
      const [batchDetailResponse] = await invoiceBatchApi.detail(batchId);

      if (
        batchDetailResponse.code === 200 &&
        batchDetailResponse.data.length > 0
      ) {
        const batch = batchDetailResponse.data[0];
        const isIssued = batch.status === "ISSUED";

        if (!isIssued) {
          setValidationError(`批次状态: ${batch.status}，尚未发行，无法购买`);
        }
      } else {
        setValidationError("未能获取批次状态，请稍后重试");
      }
    } catch (error) {
      console.error("验证批次状态失败:", error);
      setValidationError("验证批次状态时发生错误");
    } finally {
      setIsVerifying(false);
    }
  };

  const validatePurchase = (): boolean => {
    if (!token) {
      setValidationError("Token data is missing");
      return false;
    }

    if (amount <= 0) {
      setValidationError("Please enter a valid amount greater than 0");
      return false;
    }

    const availableAmount = Number(token.available_token_amount);
    if (amount > availableAmount) {
      setValidationError(
        `Amount exceeds available tokens (${availableAmount})`
      );
      return false;
    }

    return true;
  };

  const handleConfirm = async () => {
    if (!validatePurchase()) return;

    try {
      // Make sure we have the correct batch ID
      const batchId = token!.batch_reference.trim();

      // Validate batch ID format
      if (!batchId || batchId.length === 0) {
        setValidationError("Invalid batch ID");
        return;
      }

      // 再次验证批次状态
      const [batchDetailResponse] = await invoiceBatchApi.detail(batchId);
      if (
        batchDetailResponse.code === 200 &&
        batchDetailResponse.data.length > 0
      ) {
        const batch = batchDetailResponse.data[0];
        if (batch.status !== "ISSUED") {
          setValidationError(`批次状态: ${batch.status}，尚未发行，无法购买`);
          return;
        }
      }

      // Calculate exact token value using the token's value per unit
      const pricePerToken = Number(token!.token_value_per_unit) || 1;
      const totalMNT = amount * pricePerToken;

      // Convert to wei - ensure we're using the right precision
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
    } catch (err: unknown) {
      console.error("Purchase error:", err);

      // Parse error messages to provide more helpful feedback
      let errorMsg = "Transaction failed";

      if (err instanceof Error) {
        errorMsg = err.message;

        if (errorMsg.includes("Invoice__BatchNotIssued")) {
          errorMsg = "This token batch has not been issued yet";
        } else if (errorMsg.includes("Invoice__InsufficientBalance")) {
          errorMsg = "Insufficient tokens available in this batch";
        } else if (errorMsg.includes("4001")) {
          errorMsg = "Transaction rejected by user";
        }
      }

      message.error(errorMsg);
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
          disabled={amount <= 0 || !!validationError || isVerifying}
          loading={isPending || isReceiptLoading || isVerifying}
          onClick={handleConfirm}
        >
          Confirm Purchase
        </Button>,
      ]}
    >
      {token && (
        <>
          {validationError && (
            <Alert
              type="error"
              message={validationError}
              className="mb-4"
              closable
              onClose={() => setValidationError(null)}
            />
          )}

          {isVerifying && (
            <Alert type="info" message="正在验证批次状态..." className="mb-4" />
          )}

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
            <Descriptions.Item label="Token Value Per Unit">
              <Tag color="green">{token.token_value_per_unit} MNT</Tag>
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
                disabled={!!validationError || isVerifying}
              />
            </Form.Item>

            {amount > 0 && (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-2">
                <p>
                  <strong>Total Cost:</strong>{" "}
                  {(amount * Number(token.token_value_per_unit || 1)).toFixed(
                    4
                  )}{" "}
                  MNT
                </p>
              </div>
            )}
          </Form>
        </>
      )}
    </Modal>
  );
}
