import { Button, Form, Input, InputNumber, Modal } from "antd";
import { useState, useEffect, useCallback } from "react";
import { useInvoice } from "@/app/utils/contracts/useInvoice";
import { Invoice, invoiceApi } from "@/app/utils/apis";
import { message } from "@/app/components/ui/Message";
import { getAddress0 } from "@/app/utils/format";

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
  setProcessingIds,
  processingIds,
}: CreateTokenBatchModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);

  const { useCreateTokenBatch } = useInvoice();
  const { createTokenBatch } = useCreateTokenBatch({
    onSuccess: () => {
      updateBackend();
      setSubmitting(false);
      setProcessingIds(
        processingIds.filter((id) => !selectedInvoices.includes(id))
      );
      message.success("Token batch created successfully");
    },
    onError: (error) => {
      console.error(error);
      setSubmitting(false);
      setProcessingIds(
        processingIds.filter((id) => !selectedInvoices.includes(id))
      );
    },
  });

  const updateBackend = useCallback(async () => {
    try {
      const detailPromises = [];
      for (let i = 0; i < invoiceNumbers.length; i++) {
        try {
          const detailResponse = invoiceApi.detail(invoiceNumbers[i]);
          detailPromises.push(detailResponse);
        } catch (err) {
          console.error(`Error checking invoice ${invoiceNumbers[i]}:`, err);
          break;
        }
      }

      const detailResponses: {
        code: number;
        msg: string;
        data: Invoice[];
      }[] = await Promise.all(detailPromises);

      if (
        detailResponses.some((response) => response.code !== 200) ||
        detailResponses.some((response) => response.data.length === 0)
      ) {
        message.error("Failed to check invoice details");
        return;
      }

      const invoiceIds = detailResponses
        .map((invoice) => invoice.data.map((invoice) => invoice.id))
        .flat();

      const issueResponse = await invoiceApi.issue(invoiceIds, batchId);
      if (issueResponse.code !== 200) {
        console.error(`Failed to issue invoice`);
      }
      console.log("issueResponse!!", issueResponse);
    } catch (error) {
      console.error("Error updating backend:", error);
      message.error("Failed to update backend status");
    }
  }, [batchId, invoiceNumbers]);

  const handleCancel = () => {
    if (submitting) {
      return; // Prevent closing during submission
    }
    form.resetFields();
    onCancel();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    setProcessingIds([...processingIds, ...selectedInvoices]);
    // 利率的表示形式：(5% -> 500)
    const formattedValues: TokenBatchFormValues = {
      ...values,
      interestRate: Math.floor(values.interestRate * 100),
    };

    await createTokenBatch(
      batchId,
      invoiceNumbers,
      formattedValues.stableTokenAddress,
      formattedValues.minTerm,
      formattedValues.maxTerm,
      formattedValues.interestRate
    );
  };

  useEffect(() => {
    if (open) {
      form.resetFields();

      form.setFieldsValue({
        stableTokenAddress: getAddress0(),
        minTerm: 3,
        maxTerm: 12,
        interestRate: 5, // 5%
      });
    }

    return () => {};
  }, [open, form]);

  useEffect(() => {
    const newBatchId = `BATCH-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
    setBatchId(newBatchId);
  }, []);

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
          loading={submitting}
          onClick={handleSubmit}
        >
          Create Batch
        </Button>,
      ]}
    >
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
