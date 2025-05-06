"use client";
// 我的票据
import { useInvoice } from "@/app/utils/contracts/useInvoice";
// import { useBatchInvoices } from "@/app/utils/contracts/useBatchInvoices";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Button,
  Table,
  Input,
  Tooltip,
  Modal,
  Typography,
  Space,
  Tag,
  Card,
  Form,
  DatePicker,
} from "antd";
import { SearchOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { invoiceApi, Invoice, CreateInvoiceRequest } from "@/app/utils/apis";
import { message } from "@/app/components/Message";

const { Title } = Typography;

// 创建票据弹窗组件
const CreateInvoiceModal = ({
  open,
  onCancel,
  onSuccess,
}: {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}) => {
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
};

export default function MyBillsPage() {
  const { isConnected } = useAccount();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const { useBatchCreateInvoices } = useInvoice();
  // const { getInvoiceDetails } = useBatchInvoices();
  const { batchCreateInvoices, isPending, isSuccess, error } =
    useBatchCreateInvoices();

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await invoiceApi.list();
      if (response.code === 200) {
        setInvoices(response.data);
      } else {
        Modal.error({
          title: "Failed to load invoices",
          content: response.msg || "Could not retrieve invoices data",
        });
      }
    } catch (error) {
      console.error(error);
      Modal.error({
        title: "Error",
        content: "Failed to load invoices. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadInvoices();
    }
  }, [isConnected]);

  const handleIssueInvoices = async () => {
    if (selectedInvoices.length === 0) {
      message.warning("Please select at least one invoice to issue");
      return;
    }

    setProcessingIds([...processingIds, ...selectedInvoices]);

    try {
      const response = await invoiceApi.issue(selectedInvoices);
      if (response.code === 0 || response.code === 200) {
        message.success("Invoices issued successfully");
        await loadInvoices();
        setSelectedInvoices([]);
      } else {
        message.error(response.msg || "Failed to issue invoices");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to issue invoices");
    } finally {
      setProcessingIds(
        processingIds.filter((id) => !selectedInvoices.includes(id))
      );
    }
  };

  const handleVerifyInvoice = async (invoiceNumber: string, id: string) => {
    setProcessingIds([...processingIds, invoiceNumber]);

    try {
      // 1. 获取票据详情
      const res = await invoiceApi.detail(invoiceNumber);
      if (!res || res.code !== 200) {
        throw new Error("Invoice not found");
      }
      const invoice = res.data[0];

      // 2. 准备合约数据 - 修改为匹配 InvoiceData 类型
      const invoiceData = {
        invoice_number: invoice.invoice_number,
        payee: invoice.payee as `0x${string}`,
        payer: invoice.payer as `0x${string}`,
        amount: Number(invoice.amount),
        ipfs_hash: invoice.invoice_ipfs_hash,
        contract_hash: invoice.contract_ipfs_hash,
        timestamp: Math.floor(Date.now() / 1000),
        due_date: invoice.due_date,
        token_batch: "",
        is_cleared: false,
        is_valid: false,
      };

      // TODO：目前的 abi 中似乎移除了这个函数
      console.log("start to invoke contract", invoice, invoiceData);
      // 3. 调用合约的 batchCreateInvoices 函数
      await batchCreateInvoices([invoiceData]);
      // 等待交易完成
      while (isPending) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      if (error) throw new Error("Transaction failed");

      // 4. 合约交易成功后，调用后端 API 更新状态
      const response = await invoiceApi.verify(id);
      if (response.code === 0 || response.code === 200) {
        message.success("Invoice verified successfully");
        await loadInvoices();
      } else {
        message.error(response.msg || "Failed to verify invoice");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to verify invoice");
    } finally {
      setProcessingIds(processingIds.filter((pid) => pid !== id));
    }
  };

  const columns = [
    {
      title: "Select",
      key: "select",
      render: (_: unknown, record: Invoice) => (
        <input
          type="checkbox"
          disabled={
            record.status !== "VERIFIED" || processingIds.includes(record.id)
          }
          checked={selectedInvoices.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedInvoices([...selectedInvoices, record.id]);
            } else {
              setSelectedInvoices(
                selectedInvoices.filter((id) => id !== record.id)
              );
            }
          }}
        />
      ),
    },
    {
      title: "Invoice ID",
      dataIndex: "id",
      key: "id",
      render: (text: string, record: Invoice) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: "Invoice Number",
      dataIndex: "invoice_number",
      key: "invoice_number",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${Number(amount).toLocaleString()}`,
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
    },
    {
      title: "Payee",
      dataIndex: "payee",
      key: "payee",
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text.slice(0, 10)}...</span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        let color = "default";
        if (text === "PENDING") color = "orange";
        if (text === "VERIFIED") color = "blue";
        if (text === "ISSUED") color = "green";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (timestamp: number) => new Date(timestamp).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Invoice) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === "PENDING" && (
            <Button
              type="primary"
              size="small"
              loading={processingIds.includes(record.id)}
              onClick={() =>
                handleVerifyInvoice(record.invoice_number, record.id)
              }
            >
              Verify
            </Button>
          )}
          {/* {record.status === "VERIFIED" && (
            <Button
              type="primary"
              size="small"
              loading={processingIds.includes(record.id)}
              onClick={() => {
                setSelectedInvoices([record.id]);
                handleIssueInvoices();
              }}
            >
              Issue
            </Button>
          )} */}
        </Space>
      ),
    },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleViewDetail = async (invoice: Invoice) => {
    try {
      // Get invoice details
      const response = await invoiceApi.detail(invoice.invoice_number);
      if (response.code === 0) {
        setSelectedInvoice({ ...invoice, ...response.data });
      } else {
        setSelectedInvoice(invoice);
      }
      setShowDetailModal(true);
    } catch (error) {
      console.error(error);
      message.error("Failed to load invoice details");
      setSelectedInvoice(invoice);
      setShowDetailModal(true);
    }
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchText.toLowerCase())
  );

  // 清除状态并关闭模态窗
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedInvoice(null);
  };

  // 清除状态并关闭创建票据模态窗
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-zinc-900 border-zinc-800 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} style={{ color: "white", margin: 0 }}>
            My Invoices
          </Title>
          <Space>
            <Input
              placeholder="Search invoices..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: 250 }}
            />
            <Button
              type="primary"
              onClick={handleIssueInvoices}
              loading={selectedInvoices.some((id) =>
                processingIds.includes(id)
              )}
              disabled={
                selectedInvoices.length === 0 ||
                selectedInvoices.some((id) => processingIds.includes(id))
              }
            >
              Issue Selected
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Invoice
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Invoice Detail Modal */}
      <Modal
        destroyOnClose
        title="Invoice Details"
        open={showDetailModal}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Close
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <div>
            <p>
              <strong>Invoice ID:</strong> {selectedInvoice.id}
            </p>
            <p>
              <strong>Invoice Number:</strong> {selectedInvoice.invoice_number}
            </p>
            <p>
              <strong>Amount:</strong> $
              {Number(selectedInvoice.amount).toLocaleString()}
            </p>
            <p>
              <strong>Currency:</strong> {selectedInvoice.currency}
            </p>
            <p>
              <strong>Status:</strong> {selectedInvoice.status}
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {new Date(selectedInvoice.due_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Payee:</strong> {selectedInvoice.payee}
            </p>
            <p>
              <strong>Payer:</strong> {selectedInvoice.payer}
            </p>
            <p>
              <strong>Contract IPFS Hash:</strong>{" "}
              {selectedInvoice.contract_ipfs_hash}
            </p>
            <p>
              <strong>Invoice IPFS Hash:</strong>{" "}
              {selectedInvoice.invoice_ipfs_hash}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(selectedInvoice.created_at).toLocaleString()}
            </p>
            {selectedInvoice.blockchain_timestamp && (
              <p>
                <strong>Blockchain Timestamp:</strong>{" "}
                {new Date(
                  selectedInvoice.blockchain_timestamp
                ).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        open={showCreateModal}
        onCancel={handleCloseCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          loadInvoices();
        }}
      />
    </div>
  );
}
