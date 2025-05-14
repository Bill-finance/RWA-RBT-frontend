import { Button, Form, Input, InputNumber, Modal, message } from "antd";
import { useState, useEffect, useCallback } from "react";
import { useInvoice } from "@/app/utils/contracts/useInvoice";
import { invoiceApi } from "@/app/utils/apis";

interface CreateTokenBatchModalProps {
  open: boolean;
  onCancel: () => void;
  selectedInvoices: string[];
  invoiceNumbers: string[];
  onSuccess: () => void;
  setProcessingIds: (ids: string[]) => void;
  processingIds: string[];
}

export interface TokenBatchFormValues {
  stableTokenAddress: string;
  minTerm: number;
  maxTerm: number;
  interestRate: number;
}

function CreateTokenBatchModal({
  open,
  onCancel,
  selectedInvoices,
  invoiceNumbers,
  onSuccess,
  setProcessingIds,
  processingIds,
}: CreateTokenBatchModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [creationComplete, setCreationComplete] = useState(false);
  const [confirmationComplete, setConfirmationComplete] = useState(false);

  // Get contract hooks
  const { useCreateTokenBatch, useConfirmTokenBatchIssue } = useInvoice();
  const {
    createTokenBatch: executeCreateTokenBatch,
    isPending: isCreateBatchPending,
    isSuccess: isCreateBatchSuccess,
    error: createBatchError,
  } = useCreateTokenBatch();

  const {
    isPending: isConfirmPending,
    isSuccess: isConfirmSuccess,
    error: confirmError,
  } = useConfirmTokenBatchIssue();

  // Update backend after confirmation is complete
  const updateBackend = useCallback(
    async (batchId: string) => {
      try {
        // First verify if the batch was properly created by checking invoices
        let verificationAttempts = 0;
        let allInvoicesVerified = false;

        // Try verification a few times with delays
        while (verificationAttempts < 3 && !allInvoicesVerified) {
          verificationAttempts++;
          allInvoicesVerified = true;

          // Check a sample of invoices to be sure
          for (let i = 0; i < Math.min(2, invoiceNumbers.length); i++) {
            try {
              const detailResponse = await invoiceApi.detail(invoiceNumbers[i]);
              if (detailResponse.code !== 200 || !detailResponse.data.length) {
                console.warn(`Invoice ${invoiceNumbers[i]} details not found`);
                allInvoicesVerified = false;
                break;
              }
            } catch (err) {
              console.error(
                `Error checking invoice ${invoiceNumbers[i]}:`,
                err
              );
              allInvoicesVerified = false;
              break;
            }
          }

          if (!allInvoicesVerified && verificationAttempts < 3) {
            // Wait before trying again
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }

        // Even if verification fails, we'll still try to update the backend
        // since the blockchain transaction was successful

        // Update backend via API with multiple retries
        let backendUpdateAttempts = 0;
        let backendUpdateSuccess = false;

        while (backendUpdateAttempts < 3 && !backendUpdateSuccess) {
          backendUpdateAttempts++;

          try {
            const response = await invoiceApi.issue(selectedInvoices, batchId);

            if (response.code === 0 || response.code === 200) {
              message.success(
                "Invoices issued successfully as batch: " + batchId
              );
              backendUpdateSuccess = true;
              // Refresh the list and close modal
              onSuccess();
              onCancel();
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
            "Blockchain transactions were successful, but backend could not be updated. Please contact support."
          );
        }
      } catch (error) {
        console.error("Error updating backend:", error);
        message.error("Failed to update backend status");
        setError(
          error instanceof Error ? error.message : "Failed to update backend"
        );
      } finally {
        setSubmitting(false);
        // Clear processing IDs
        setProcessingIds(
          processingIds.filter((id) => !selectedInvoices.includes(id))
        );
      }
    },
    [
      selectedInvoices,
      processingIds,
      setProcessingIds,
      invoiceNumbers,
      onSuccess,
      onCancel,
    ]
  );

  // Reset all states when modal opens/closes
  useEffect(() => {
    if (open) {
      setError(null);
      form.resetFields();
      setCurrentBatchId(null);
      setCreationComplete(false);
      setConfirmationComplete(false);

      // Set default values
      form.setFieldsValue({
        stableTokenAddress: "0x0000000000000000000000000000000000000000",
        minTerm: 3,
        maxTerm: 12,
        interestRate: 5, // 5%
      });
    }
  }, [open, form]);

  // Monitor token batch creation status
  useEffect(() => {
    if (!currentBatchId) return;

    // Check for error condition (transaction rejected or failed)
    if (createBatchError) {
      console.error("Token batch creation failed:", createBatchError);
      message.error("Failed to create token batch on blockchain");
      setError("Transaction failed or was rejected");
      setSubmitting(false);
      // Clear processing IDs
      setProcessingIds(
        processingIds.filter((id) => !selectedInvoices.includes(id))
      );
      return;
    }

    if (isCreateBatchSuccess && !creationComplete) {
      setCreationComplete(true);
      message.success("Token batch created successfully!");

      // Proceed to confirmation step
      // const confirmBatch = async () => {
      //   try {
      //     message.info("Confirming token batch issuance...");
      //     await confirmTokenBatchIssue(currentBatchId);
      //   } catch (err) {
      //     console.error("Failed to initiate token batch confirmation:", err);
      //     message.error("Failed to confirm token batch issuance");
      //   }
      // };

      // confirmBatch();

      // Skip confirmation and directly update backend
      if (currentBatchId) {
        updateBackend(currentBatchId);
      }
    }
  }, [
    currentBatchId,
    isCreateBatchPending,
    isCreateBatchSuccess,
    createBatchError,
    creationComplete,
    processingIds,
    selectedInvoices,
    // confirmTokenBatchIssue,
    setProcessingIds,
    updateBackend,
  ]);

  // Monitor token batch confirmation status
  useEffect(() => {
    if (!currentBatchId || !creationComplete) return;

    // Check for error condition (transaction rejected or failed)
    if (confirmError) {
      console.error("Token batch confirmation failed:", confirmError);
      message.error("Failed to confirm token batch on blockchain");
      setError("Confirmation transaction failed or was rejected");
      setSubmitting(false);
      // Clear processing IDs
      setProcessingIds(
        processingIds.filter((id) => !selectedInvoices.includes(id))
      );
      return;
    }

    if (isConfirmSuccess && !confirmationComplete) {
      setConfirmationComplete(true);
      message.success("Token batch issuance confirmed!");

      // Proceed to backend update
      updateBackend(currentBatchId);
    }
  }, [
    currentBatchId,
    creationComplete,
    isConfirmPending,
    isConfirmSuccess,
    confirmError,
    confirmationComplete,
    processingIds,
    selectedInvoices,
    updateBackend,
    setProcessingIds,
  ]);

  const handleCancel = () => {
    if (submitting) {
      return; // Prevent closing during submission
    }
    setError(null);
    form.resetFields();
    onCancel();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      setError(null);

      // Convert interest rate from percentage to basis points (5% -> 500)
      const formattedValues: TokenBatchFormValues = {
        ...values,
        interestRate: Math.floor(values.interestRate * 100),
      };

      // Mark selected invoices as processing
      setProcessingIds([...processingIds, ...selectedInvoices]);

      // Generate batch ID
      const newBatchId = `BATCH-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      setCurrentBatchId(newBatchId);

      // Create token batch on blockchain
      try {
        message.loading("Creating token batch...", 0);
        await executeCreateTokenBatch(
          newBatchId,
          invoiceNumbers,
          formattedValues.stableTokenAddress,
          formattedValues.minTerm,
          formattedValues.maxTerm,
          formattedValues.interestRate
        );
      } catch (err) {
        console.error("Failed to initiate token batch creation:", err);
        message.error("Failed to create token batch");
        setSubmitting(false);
        setProcessingIds(
          processingIds.filter((id) => !selectedInvoices.includes(id))
        );
        throw err;
      }
    } catch (err: unknown) {
      console.error("Form validation or submission failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the token batch"
      );
      setSubmitting(false);
      message.destroy();
    }
  };

  return (
    <Modal
      title="Create Token Batch"
      open={open}
      onCancel={handleCancel}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={submitting}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger={!!error}
          loading={submitting}
          onClick={handleSubmit}
        >
          {error ? "Retry" : "Create Batch"}
        </Button>,
      ]}
    >
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      <Form form={form} layout="vertical">
        <Form.Item
          name="stableTokenAddress"
          label="Stable Token Address"
          rules={[
            { required: true, message: "Please enter stable token address" },
          ]}
          help="The ERC20 token address to be used for payments"
        >
          <Input placeholder="Enter stable token address (e.g., USDC, USDT)" />
        </Form.Item>

        <Form.Item
          name="minTerm"
          label="Minimum Term (months)"
          rules={[{ required: true, message: "Please enter minimum term" }]}
          help="Minimum duration in months"
        >
          <InputNumber min={1} max={36} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="maxTerm"
          label="Maximum Term (months)"
          rules={[
            { required: true, message: "Please enter maximum term" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("minTerm") <= value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    "Maximum term must be greater than or equal to minimum term"
                  )
                );
              },
            }),
          ]}
          help="Maximum duration in months"
        >
          <InputNumber min={1} max={60} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="interestRate"
          label="Interest Rate (%)"
          rules={[{ required: true, message: "Please enter interest rate" }]}
          help="Annual interest rate in percentage (e.g., 5 for 5%)"
        >
          <InputNumber
            min={0}
            max={100}
            step={0.01}
            precision={2}
            style={{ width: "100%" }}
            formatter={(value) => `${value}%`}
            parser={(value: string | undefined) => {
              if (!value) return 0;
              const parsed = parseFloat(value.replace("%", ""));
              return isNaN(parsed) ? 0 : parsed;
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateTokenBatchModal;
