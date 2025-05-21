import { Button, Form, Input, InputNumber, Modal } from "antd";
import { useState, useEffect, useCallback, useRef } from "react";
import { useInvoice } from "@/app/utils/contracts/useInvoice";
import { Invoice, invoiceApi } from "@/app/utils/apis";
import { message } from "@/app/components/ui/Message";
import { getAddress0 } from "@/app/utils/format";

interface CreateTokenBatchModalProps {
  open: boolean;
  onCancel: () => void;
  selectedInvoices: Invoice[];
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

function CreateTokenBatchModal(props: CreateTokenBatchModalProps) {
  const {
    open,
    onCancel,
    onSuccess,
    setProcessingIds,
    processingIds,
    selectedInvoices,
  } = props;
  const selectedInvoiceIds = selectedInvoices.map((inv) => inv.id);
  const invoiceNumbers = selectedInvoices.map((inv) => inv.invoice_number);
  console.log("invoiceNumbers", invoiceNumbers);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);

  // // TODO: 这里有闭包问题，先这么解决，后面重构
  const latestValuesRef = useRef({
    invoiceNumbers: invoiceNumbers,
    batchId: null as string | null,
    selectedInvoiceIds: selectedInvoiceIds,
  });

  useEffect(() => {
    latestValuesRef.current.invoiceNumbers = invoiceNumbers;
    latestValuesRef.current.selectedInvoiceIds = selectedInvoiceIds;
  }, [invoiceNumbers, selectedInvoiceIds]);

  useEffect(() => {
    latestValuesRef.current.batchId = batchId;
  }, [batchId]);

  const { useCreateTokenBatch } = useInvoice();
  const { createTokenBatch } = useCreateTokenBatch({
    onSuccess: () => {
      message.success("Token batch created successfully");
      updateBackend();
      onSuccess();
      setSubmitting(false);
    },
    onError: (error) => {
      console.error(error);
      setSubmitting(false);
    },
  });

  const updateBackend = useCallback(async () => {
    try {
      console.log(
        "updateBackend with invoiceNumbers:",
        latestValuesRef.current.invoiceNumbers
      );

      const detailPromises = latestValuesRef.current.invoiceNumbers.map(
        (invoiceNumber) => invoiceApi.detail(invoiceNumber)
      );
      const detailResponses = await Promise.all(detailPromises);

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
      // TODO: err No invoices selected for issuance
      console.log("issueResponse!!", issueResponse);
    } catch (error) {
      console.error("Error updating backend:", error);
      message.error("Failed to update backend status");
    }
  }, []); // Remove dependencies as we're using ref values now

  const handleCancelModal = () => {
    if (submitting) {
      return; // Prevent closing during submission
    }
    form.resetFields();
    onCancel();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    setProcessingIds([...processingIds, ...selectedInvoiceIds]);
    // 利率的表示形式：(5% -> 500)
    const formattedValues: TokenBatchFormValues = {
      ...values,
      interestRate: Math.floor(values.interestRate * 100),
    };
    const params = {
      batchId,
      invoiceNumbers,
      stableToken: formattedValues.stableTokenAddress as `0x${string}`,
      minTerm: formattedValues.minTerm,
      maxTerm: formattedValues.maxTerm,
      interestRate: formattedValues.interestRate,
    };
    console.log("params????", params);

    await createTokenBatch(params);
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
      onCancel={handleCancelModal}
      destroyOnClose
      footer={[
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
