import { Button, Modal, Typography, Tag, Descriptions } from "antd";
import { InvoiceBatch, tokenApi } from "@/app/utils/apis";
import { message } from "@/app/components/ui/Message";
import { useState, useEffect, useCallback } from "react";
import { useInvoice } from "@/app/utils/contracts/useInvoice";
import { Form } from "antd";

const { Title } = Typography;

interface TokenFormValues {
  interest_rate_apy: number;
  maturity_date: Date;
}

interface ConfirmBatchModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  selectedBatch: InvoiceBatch | null;
}

function ConfirmBatchModal({
  open,
  onCancel,
  onSuccess,
  selectedBatch,
}: ConfirmBatchModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get contract hooks for batch confirmation
  const { useConfirmTokenBatchIssue } = useInvoice();

  const [form] = Form.useForm<TokenFormValues>();

  const {
    confirmTokenBatchIssue,
    isPending: isConfirmPending,
    isSuccess: isConfirmSuccess,
    error: confirmError,
  } = useConfirmTokenBatchIssue();

  const updateBackend = useCallback(
    async (tokenId: string) => {
      if (!selectedBatch) return;

      try {
        let backendUpdateAttempts = 0;
        let backendUpdateSuccess = false;

        // Try up to 3 times to update the backend
        while (backendUpdateAttempts < 3 && !backendUpdateSuccess) {
          backendUpdateAttempts++;

          try {
            // Use default values if form is not available
            const defaultMaturityDate = new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            );

            const response = await tokenApi.createToken({
              batch_id: selectedBatch.id,
              interest_rate_apy: 5, // Default interest rate 5%
              maturity_date: defaultMaturityDate.valueOf(),
              token_value: selectedBatch.total_amount,
              total_token_supply: selectedBatch.total_amount,
              blockchain_token_id: tokenId,
            });

            if (response.code === 200) {
              message.success(
                "Successfully created and recorded token from batch"
              );
              backendUpdateSuccess = true;
              onSuccess();
            } else {
              if (backendUpdateAttempts < 3) {
                console.warn(
                  `Backend update attempt ${backendUpdateAttempts} failed:`,
                  response.msg
                );
                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, 3000));
              } else {
                throw new Error(
                  response.msg ||
                    "Failed to update backend after multiple attempts"
                );
              }
            }
          } catch (apiError) {
            if (backendUpdateAttempts < 3) {
              console.error(
                `Backend API error on attempt ${backendUpdateAttempts}:`,
                apiError
              );
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 3000));
            } else {
              throw apiError;
            }
          }
        }
      } catch (error) {
        console.error("Error updating backend:", error);
        message.error("Failed to update backend with token information");
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSuccess, selectedBatch]
  );

  // TODO: 目前是 mock 数据，后面改成从后端获取
  // Reset states when modal opens
  useEffect(() => {
    if (open) {
      setIsSubmitting(false);

      // Initialize form with default values
      form.setFieldsValue({
        interest_rate_apy: 5,
        maturity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
  }, [open, form]);

  useEffect(() => {
    if (!isConfirmPending) {
      if (isConfirmSuccess && selectedBatch) {
        message.success("Batch confirmed successfully!");
        updateBackend(selectedBatch.id);
      } else if (confirmError) {
        message.error("Failed to confirm batch on blockchain");
        setIsSubmitting(false);
      }
    }
  }, [
    isConfirmPending,
    isConfirmSuccess,
    confirmError,
    selectedBatch,
    updateBackend,
  ]);

  // Handle confirm action
  const handleConfirm = async () => {
    if (!selectedBatch) return;

    try {
      setIsSubmitting(true);
      message.loading("Confirming batch on blockchain...", 0);
      await confirmTokenBatchIssue(selectedBatch.id);
    } catch (err) {
      console.error("Batch confirmation failed:", err);
      setIsSubmitting(false);
      message.destroy();
    }
  };

  // Remove duplicate token creation useEffect, since we already handle this in updateBackend

  return (
    <Modal
      destroyOnClose
      title="Confirm Invoice Batch"
      open={open}
      onCancel={() => {
        if (!isSubmitting) {
          onCancel();
        }
      }}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isSubmitting}
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          Confirm
        </Button>,
      ]}
    >
      {selectedBatch && (
        <>
          <Title level={5} style={{ marginBottom: 16 }}>
            You are confirming this invoice batch as the debtor
          </Title>

          <Descriptions
            styles={{ label: { fontWeight: "bold" } }}
            bordered
            column={2}
            size="small"
            className="mb-6"
          >
            <Descriptions.Item label="Batch ID">
              {selectedBatch.id}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  selectedBatch.status === "PENDING"
                    ? "orange"
                    : selectedBatch.status === "VERIFIED"
                    ? "blue"
                    : selectedBatch.status === "ISSUED"
                    ? "green"
                    : "default"
                }
              >
                {selectedBatch.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payer (Debtor)">
              {selectedBatch.payer}
            </Descriptions.Item>
            <Descriptions.Item label="Payee (Creditor)">
              {selectedBatch.payee}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              {selectedBatch.accepted_currency}{" "}
              {Number(selectedBatch.total_amount).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Invoice Count">
              {selectedBatch.invoice_count}
            </Descriptions.Item>
          </Descriptions>

          <p style={{ marginTop: 16 }}>
            By confirming this batch, you acknowledge these invoices as valid
            and authorize the issuance of tokens backed by these receivables.
          </p>
        </>
      )}
    </Modal>
  );
}

export default ConfirmBatchModal;
