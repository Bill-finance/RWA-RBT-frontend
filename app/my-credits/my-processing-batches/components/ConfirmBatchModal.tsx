import { Button, Modal, Typography, Tag, Descriptions } from "antd";
import { InvoiceBatch } from "@/app/utils/apis";
import { message } from "@/app/components/Message";
import { useState, useEffect } from "react";
import { useInvoice } from "@/app/utils/contracts/useInvoice";

const { Title } = Typography;

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
  const [batchConfirmed, setBatchConfirmed] = useState(false);

  // Get contract hooks for batch confirmation
  const { useConfirmTokenBatchIssue } = useInvoice();

  const {
    confirmTokenBatchIssue,
    isPending: isConfirmPending,
    isSuccess: isConfirmSuccess,
    error: confirmError,
  } = useConfirmTokenBatchIssue();

  const updateBackend = async (tokenId: string) => {
    if (!selectedBatch) return;

    try {
      let backendUpdateAttempts = 0;
      let backendUpdateSuccess = false;

      // Try up to 3 times to update the backend
      while (backendUpdateAttempts < 3 && !backendUpdateSuccess) {
        backendUpdateAttempts++;

        try {
          const formValues = form.getFieldsValue() as TokenFormValues;

          const response = await tokenApi.createToken({
            batch_id: selectedBatch.id,
            interest_rate_apy: Number(formValues.interest_rate_apy),
            maturity_date: formValues.maturity_date.valueOf(),
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
  };

  // Reset states when modal opens
  useEffect(() => {
    if (open) {
      setBatchConfirmed(false);
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!isConfirmPending) {
      if (isConfirmSuccess) {
        message.success("Batch confirmed successfully!");
        setTimeout(() => onSuccess(), 1500);
        updateBackend(selectedBatch.id);
      } else if (confirmError) {
        message.error("Failed to confirm batch on blockchain");
      }
    }
  }, [isConfirmPending]);
  // Handle confirm action
  const handleConfirm = async () => {
    if (!selectedBatch) return;

    try {
      setIsSubmitting(true);
      message.loading("Confirming batch on blockchain...", 0);

      // Call contract to confirm token batch
      await confirmTokenBatchIssue(selectedBatch.id);

      // The confirmation status will be handled in the useEffect
    } catch (err) {
      console.error("Batch confirmation failed:", err);
      setIsSubmitting(false);
      message.destroy();
    }
  };

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
          Confirm Batch
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
