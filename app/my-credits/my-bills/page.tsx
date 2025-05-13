"use client";
// 我的票据
import { useInvoice } from "@/app/utils/contracts/useInvoice";
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
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  PlusOutlined,
  CheckOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { invoiceApi, Invoice } from "@/app/utils/apis";
import { message } from "@/app/components/Message";
import CreateInvoiceModal from "./components/CreateInvoiceModal";
import CreateTokenBatchModal from "./components/CreateTokenBatchModal";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";
import HashText from "@/app/components/ui/HashText";

const { Title } = Typography;

export default function MyBillsPage() {
  const { isConnected } = useAccount();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTokenBatchModal, setShowTokenBatchModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  const { useBatchCreateInvoices } = useInvoice();
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

  // Add a useEffect to track the status of the current batch
  useEffect(() => {
    if (selectedInvoices.length > 0 && processingIds.length > 0) {
      const timer = setTimeout(() => {
        // Monitor processing status periodically
        console.log(`Monitoring invoices: ${selectedInvoices.join(", ")}`);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [selectedInvoices, processingIds]);

  const handleIssueInvoices = async () => {
    if (selectedInvoices.length === 0) {
      message.warning("Please select at least one invoice to issue");
      return;
    }

    // Show the token batch modal to collect user input
    setShowTokenBatchModal(true);
  };

  const handleVerifyInvoice = async (invoiceNumber: string, id: string) => {
    // 立即设置 loading 状态，防止重复点击
    setProcessingIds([...processingIds, id]);

    try {
      // 1. 获取票据详情
      const res = await invoiceApi.detail(invoiceNumber);
      if (!res || res.code !== 200) {
        throw new Error("Invoice not found");
      }
      const invoice = res.data[0];

      // 2. 准备合约数据
      const invoiceData = {
        invoice_number: invoice.invoice_number,
        payee: invoice.payee as `0x${string}`,
        payer: invoice.payer as `0x${string}`,
        amount: invoice.amount.toString(),
        ipfs_hash: invoice.invoice_ipfs_hash,
        contract_hash: invoice.contract_ipfs_hash,
        timestamp: Math.floor(Date.now() / 1000).toString(),
        due_date: invoice.due_date.toString(),
        token_batch: invoice.token_batch || "",
        is_cleared: invoice.is_cleared,
        is_valid: invoice.is_valid,
      };

      // 3. 调用合约的 batchCreateInvoices 函数
      try {
        await batchCreateInvoices([invoiceData]);
      } catch (error: unknown) {
        // 检查是否是用户取消
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === 4001
        ) {
          message.error("User cancelled the transaction");
          // 用户取消时也需要清除 loading 状态
          setProcessingIds(processingIds.filter((pid) => pid !== id));
          return;
        }
        throw error; // 重新抛出其他错误
      }

      // 4. 等待交易完成
      if (isPending) {
        // 如果交易还在进行中，直接返回
        // 后续的状态变化会由 useEffect 处理
        return;
      }
    } catch (error) {
      console.error(error);
      message.error(
        error instanceof Error ? error.message : "Failed to verify invoice"
      );
      // 发生错误时清除 loading 状态
      setProcessingIds(processingIds.filter((pid) => pid !== id));
    }
  };

  // 监听交易状态变化
  useEffect(() => {
    // Only proceed if there are transactions to process and
    // a transaction status has changed
    if (processingIds.length === 0 || isPending) {
      return;
    }

    // Process transaction completion
    const handleTransactionResult = async () => {
      try {
        // Get the first processing ID
        const currentProcessingId = processingIds[0];
        if (!currentProcessingId) return;

        if (isSuccess) {
          // Transaction succeeded
          try {
            // Call backend API to update status
            const response = await invoiceApi.verify(currentProcessingId);
            if (response.code === 0 || response.code === 200) {
              await loadInvoices();
            } else {
              throw new Error(response.msg || "Failed to verify invoice");
            }
          } catch (error) {
            console.error("API verification failed:", error);
            message.error(
              error instanceof Error
                ? error.message
                : "Failed to verify invoice"
            );
          }
        } else if (error) {
          // Transaction failed
          console.error("Transaction failed:", error);
          message.error(error.message || "Transaction failed");
        }

        // Remove processed ID regardless of outcome - do this outside the conditional blocks
        setProcessingIds((prev) =>
          prev.filter((id) => id !== currentProcessingId)
        );
      } catch (err) {
        console.error("Error handling transaction result:", err);
        // Still remove the ID to prevent getting stuck
        setProcessingIds((prev) =>
          prev.filter((id) => id !== processingIds[0])
        );
      }
    };

    // Run the handler
    handleTransactionResult();
  }, [isPending, isSuccess, error]); // Don't include processingIds in dependencies

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp || timestamp === 0) {
      return "Not set";
    }
    return dayjs(timestamp * 1000).format("YYYY-MM-DD HH:mm");
  };

  const columns = [
    {
      title: "",
      key: "select",
      fixed: "left",
      width: 64,
      align: "center" as const,
      // Antd 的 Checkbox 不够灵活
      render: (_: unknown, record: Invoice) => {
        const isDisabled =
          record.status !== "VERIFIED" || processingIds.includes(record.id);
        return (
          <Input
            style={{
              height: 16,
              width: 16,
              textAlign: "center",
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
            type="checkbox"
            disabled={isDisabled}
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
        );
      },
    },
    // {
    //   title: "Invoice ID",
    //   dataIndex: "id",
    //   key: "id",
    //   render: (text: string, record: Invoice) => (
    //     <a onClick={() => handleViewDetail(record)}>{text}</a>
    //   ),
    // },
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
      width: 100,
    },
    {
      title: "Payer",
      dataIndex: "payer",
      key: "payer",
      width: 150,
      render: (text: string) => <HashText text={text} />,
    },
    {
      title: "Payee",
      dataIndex: "payee",
      key: "payee",
      width: 150,
      render: (text: string) => <HashText text={text} />,
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
      render: (timestamp: number) => formatTimestamp(timestamp),
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 64,
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
            <Tooltip title="Verify">
              <Button
                icon={<CheckOutlined />}
                type="text"
                loading={processingIds.includes(record.id)}
                onClick={() =>
                  handleVerifyInvoice(record.invoice_number, record.id)
                }
              />
            </Tooltip>
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
      // Get invoice details with blockchain status
      const response = await invoiceApi.detail(invoice.invoice_number);
      if (response.code === 200 && response.data[0]) {
        setSelectedInvoice({ ...invoice, ...response.data[0] });
      } else {
        setSelectedInvoice(invoice);
        message.warning("Could not fetch latest blockchain status");
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

  // Close token batch modal
  const handleCloseTokenBatchModal = () => {
    setShowTokenBatchModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-zinc-900 border-zinc-800 shadow-lg mb-8 ">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <Title level={2} style={{ color: "white", margin: 0 }}>
            My Invoices
          </Title>
          <Space wrap className="w-full md:w-auto">
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
              icon={<SendOutlined rotate={-45} />}
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
          scroll={{ x: 1000 }}
          columns={columns as ColumnsType<Invoice>}
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
        width={800}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Close
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <Descriptions
            styles={{ label: { fontWeight: "bold" } }}
            bordered
            column={2}
            size="small"
          >
            <Descriptions.Item label="Invoice ID" span={2}>
              {selectedInvoice.id}
            </Descriptions.Item>
            <Descriptions.Item label="Invoice Number" span={2}>
              {selectedInvoice.invoice_number}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              ${Number(selectedInvoice.amount).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Currency">
              {selectedInvoice.currency}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  selectedInvoice.status === "PENDING"
                    ? "orange"
                    : selectedInvoice.status === "VERIFIED"
                    ? "blue"
                    : selectedInvoice.status === "ISSUED"
                    ? "green"
                    : "default"
                }
              >
                {selectedInvoice.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">
              {formatTimestamp(selectedInvoice.due_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Payee" span={2}>
              <Tooltip title={selectedInvoice.payee}>
                {selectedInvoice.payee}
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Payer" span={2}>
              <Tooltip title={selectedInvoice.payer}>
                {selectedInvoice.payer}
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Contract IPFS Hash" span={2}>
              <Tooltip title={selectedInvoice.contract_ipfs_hash}>
                {selectedInvoice.contract_ipfs_hash || "Not available"}
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Invoice IPFS Hash" span={2}>
              <Tooltip title={selectedInvoice.invoice_ipfs_hash}>
                {selectedInvoice.invoice_ipfs_hash || "Not available"}
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={2}>
              {dayjs(selectedInvoice.created_at).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At" span={2}>
              {dayjs(selectedInvoice.updated_at).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Blockchain Status" span={2}>
              {selectedInvoice.status === "VERIFIED" ? (
                <Space>
                  <Tag color="green">Verified</Tag>
                </Space>
              ) : (
                <Tag color="orange">Pending Confirmation</Tag>
              )}
            </Descriptions.Item> */}
            <Descriptions.Item label="Token Batch" span={2}>
              {selectedInvoice.token_batch || "Not available"}
            </Descriptions.Item>
            <Descriptions.Item label="Cleared Status" span={2}>
              {selectedInvoice.is_cleared === true ? (
                <Tag color="green">Cleared</Tag>
              ) : selectedInvoice.is_cleared === false ? (
                <Tag color="red">Not Cleared</Tag>
              ) : (
                "Not available"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Valid Status" span={2}>
              {selectedInvoice.is_valid === true ? (
                <Tag color="green">Valid</Tag>
              ) : selectedInvoice.is_valid === false ? (
                <Tag color="red">Invalid</Tag>
              ) : (
                "Not available"
              )}
            </Descriptions.Item>
          </Descriptions>
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

      {/* Create Token Batch Modal */}
      <CreateTokenBatchModal
        open={showTokenBatchModal}
        onCancel={handleCloseTokenBatchModal}
        selectedInvoices={selectedInvoices}
        invoiceNumbers={invoices
          .filter((inv) => selectedInvoices.includes(inv.id))
          .map((inv) => inv.invoice_number)}
        onSuccess={loadInvoices}
        setProcessingIds={setProcessingIds}
        processingIds={processingIds}
      />
    </div>
  );
}
