import {
  Button,
  Modal,
  Typography,
  Tag,
  Descriptions,
  Form,
  Input,
  DatePicker,
  Alert,
} from "antd";
import { InvoiceBatch, tokenApi } from "@/app/utils/apis";
import { message } from "@/app/components/Message";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useToken } from "@/app/utils/contracts";

const { Title } = Typography;

interface IssueTokenModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  selectedBatch: InvoiceBatch | null;
}

interface TokenFormValues {
  interest_rate_apy: string;
  maturity_date: dayjs.Dayjs;
}

function IssueTokenModal({
  open,
  onCancel,
  onSuccess,
  selectedBatch,
}: IssueTokenModalProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTokenId, setCurrentTokenId] = useState<string | null>(null);
  const [tokenCreationComplete, setTokenCreationComplete] = useState(false);

  // Get contract hooks
  const { useCreateToken } = useToken();
  const {
    createToken: executeCreateToken,
    isPending: isTokenPending,
    isSuccess: isTokenSuccess,
    error: tokenError,
  } = useCreateToken();

  // Reset form and states when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        interest_rate_apy: "5",
        maturity_date: dayjs().add(1, "year"),
      });
      setError(null);
      setCurrentTokenId(null);
      setTokenCreationComplete(false);
      setIsSubmitting(false);
    }
  }, [open, form]);

  // Monitor token creation status
  useEffect(() => {
    if (!currentTokenId) return;

    // Handle token error
    if (tokenError) {
      console.error("Token creation failed:", tokenError);
      message.error("Failed to create token on blockchain");
      setError("Transaction failed or was rejected");
      setIsSubmitting(false);
      return;
    }

    // Handle token success
    if (isTokenSuccess && !tokenCreationComplete) {
      setTokenCreationComplete(true);
      message.success("Token created successfully on blockchain!");

      // Update backend status
      updateBackend(currentTokenId);
    }
  }, [
    currentTokenId,
    isTokenPending,
    isTokenSuccess,
    tokenError,
    tokenCreationComplete,
  ]);

  // Update backend after token creation is complete
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

      if (!backendUpdateSuccess) {
        setError(
          "Token created on blockchain, but backend could not be updated. Please contact support."
        );
      }
    } catch (error) {
      console.error("Error updating backend:", error);
      message.error("Failed to update backend with token information");
      setError(
        error instanceof Error ? error.message : "Failed to update backend"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBatch) return;

    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      setError(null);

      // Generate token ID
      const newTokenId = `TOKEN-${selectedBatch.id}-${Date.now()}`;
      setCurrentTokenId(newTokenId);

      // Convert form values for blockchain
      const maturityTimestamp = values.maturity_date.valueOf() / 1000; // Convert to seconds
      const interestRateBasisPoints = Math.floor(
        Number(values.interest_rate_apy) * 100
      ); // Convert to basis points

      // Create token on blockchain
      try {
        message.loading("Creating token on blockchain...", 0);

        await executeCreateToken(
          newTokenId,
          selectedBatch.id,
          selectedBatch.total_amount.toString(),
          maturityTimestamp.toString(),
          interestRateBasisPoints.toString()
        );
      } catch (err) {
        console.error("Failed to initiate token creation:", err);
        message.error("Failed to create token");
        setIsSubmitting(false);
        throw err;
      }
    } catch (err: unknown) {
      console.error("Form validation or submission failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the token"
      );
      setIsSubmitting(false);
      message.destroy();
    }
  };

  return (
    <Modal
      destroyOnClose
      title="Issue Token from Batch"
      open={open}
      onCancel={() => {
        if (!isSubmitting) {
          onCancel();
        }
      }}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isSubmitting}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          Confirm to Issue
        </Button>,
      ]}
    >
      {error && (
        <Alert
          type="error"
          message="Error"
          description={error}
          className="mb-4"
          showIcon
        />
      )}

      {selectedBatch && (
        <>
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
            <Descriptions.Item label="Payer">
              {selectedBatch.payer}
            </Descriptions.Item>
            <Descriptions.Item label="Payee">
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

          <Title level={5} style={{ color: "#e3e3e3ee", marginBottom: 10 }}>
            Token Parameters
          </Title>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              interest_rate_apy: "5",
              maturity_date: dayjs().add(1, "year"),
            }}
          >
            <Form.Item
              name="interest_rate_apy"
              label="Interest Rate (APY %)"
              rules={[
                { required: true, message: "Please enter interest rate" },
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message:
                    "Please enter a valid number with up to 2 decimal places",
                },
              ]}
            >
              <Input type="number" step="0.01" min="0" />
            </Form.Item>
            <Form.Item
              name="maturity_date"
              label="Maturity Date"
              rules={[
                { required: true, message: "Please select maturity date" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}

export default IssueTokenModal;
