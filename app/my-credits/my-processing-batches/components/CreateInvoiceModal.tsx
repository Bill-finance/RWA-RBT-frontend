import { CreateInvoiceRequest, invoiceApi } from "@/app/utils/apis/invoice";
import { Button, DatePicker, Input, Modal } from "antd";

import { Form } from "antd";
import { useEffect, useState } from "react";

interface CreateInvoiceModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

// 创建票据弹窗组件
function CreateInvoiceModal({
  open,
  onCancel,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 重置所有状态
  const handleCancel = () => {
    setError(null);
    form.resetFields();
    onCancel();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      setError(null);

      const requestData: CreateInvoiceRequest = {
        ...values,
        amount: Number(values.amount),
        due_date: Math.floor(values.due_date.valueOf() / 1000),
      };

      const response = await invoiceApi.create(requestData);

      if (response.code === 0 || response.code === 200) {
        form.resetFields();
        setError(null);
        onSuccess();
      } else {
        setError(response.msg || "Failed to create invoice");
      }
    } catch (err: unknown) {
      console.error("Form validation or submission failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating the invoice"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 每次打开时重置状态
  useEffect(() => {
    if (open) {
      setError(null);
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Create New Invoice"
      open={open}
      onCancel={handleCancel}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger={!!error}
          loading={submitting}
          onClick={handleSubmit}
        >
          {error ? "Retry" : "Create"}
        </Button>,
      ]}
    >
      {error && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}
      <Form form={form} layout="vertical" initialValues={{ currency: "USD" }}>
        <Form.Item
          name="payee"
          label="Payee Address"
          rules={[{ required: true, message: "Please enter payee address" }]}
        >
          <Input placeholder="Enter payee wallet address" />
        </Form.Item>
        <Form.Item
          name="payer"
          label="Payer Address"
          rules={[{ required: true, message: "Please enter payer address" }]}
        >
          <Input placeholder="Enter payer wallet address" />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <Input type="number" placeholder="Enter amount" />
        </Form.Item>
        <Form.Item
          name="currency"
          label="Currency"
          rules={[{ required: true, message: "Please enter currency" }]}
        >
          <Input placeholder="Enter currency (e.g., USD)" />
        </Form.Item>
        <Form.Item
          name="due_date"
          label="Due Date"
          rules={[{ required: true, message: "Please select due date" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="invoice_ipfs_hash"
          label="Invoice IPFS Hash"
          rules={[
            { required: true, message: "Please enter invoice IPFS hash" },
          ]}
        >
          <Input placeholder="Enter invoice IPFS hash" />
        </Form.Item>
        <Form.Item
          name="contract_ipfs_hash"
          label="Contract IPFS Hash"
          rules={[
            { required: true, message: "Please enter contract IPFS hash" },
          ]}
        >
          <Input placeholder="Enter contract IPFS hash" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CreateInvoiceModal;
