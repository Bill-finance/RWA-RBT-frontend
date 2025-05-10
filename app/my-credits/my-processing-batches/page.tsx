"use client";
// 我的票据
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Button,
  Table,
  Input,
  Tooltip,
  Typography,
  Space,
  Tag,
  Card,
} from "antd";
import { SearchOutlined, EyeOutlined, SendOutlined } from "@ant-design/icons";
import { InvoiceBatch, Invoice, invoiceBatchApi } from "@/app/utils/apis";
import { message } from "@/app/components/Message";
import dayjs from "dayjs";
import BatchDetailModal from "./components/BatchDetailModal";
import IssueTokenModal from "./components/IssueTokenModal";

const { Title } = Typography;

export default function MyProcessingBatchesPage() {
  const { isConnected } = useAccount();
  const [batches, setBatches] = useState<InvoiceBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InvoiceBatch | null>(null);
  const [selectedBatchInvoices, setSelectedBatchInvoices] = useState<Invoice[]>(
    []
  );

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      const response = await invoiceBatchApi.list();
      if (response.code === 200) {
        setBatches(response.data);
      } else {
        message.error(response.msg || "Could not retrieve batches data");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load batches. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadBatches();
    }
  }, [isConnected]);

  const handleViewDetail = async (batch: InvoiceBatch) => {
    try {
      const [batchDetailResponse, invoicesResponse] =
        await invoiceBatchApi.detail(batch.id);
      if (batchDetailResponse.code === 200 && invoicesResponse.code === 200) {
        setSelectedBatch(batch);
        setSelectedBatchInvoices(invoicesResponse.data);
        setShowDetailModal(true);
      } else {
        message.warning("Could not fetch batch details");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load batch details");
    }
  };

  const handleIssueToken = (batch: InvoiceBatch) => {
    setSelectedBatch(batch);
    setShowIssueModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBatch(null);
    setSelectedBatchInvoices([]);
  };

  const handleCloseIssueModal = () => {
    setShowIssueModal(false);
    setSelectedBatch(null);
  };

  const handleIssueSuccess = () => {
    handleCloseIssueModal();
    loadBatches(); // Refresh the batch list
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.id.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.creditor_name.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.debtor_name.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.status.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Batch ID",
      dataIndex: "id",
      key: "id",
      render: (text: string, record: InvoiceBatch) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: "Creditor",
      dataIndex: "creditor_name",
      key: "creditor_name",
    },
    {
      title: "Debtor",
      dataIndex: "debtor_name",
      key: "debtor_name",
    },
    {
      title: "Invoice Count",
      dataIndex: "invoice_count",
      key: "invoice_count",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount: number, record: InvoiceBatch) =>
        `${record.accepted_currency} ${Number(amount).toLocaleString()}`,
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
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: InvoiceBatch) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Issue Token">
            <Button
              type="text"
              onClick={() => handleIssueToken(record)}
              icon={<SendOutlined rotate={-45} />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-zinc-900 border-zinc-800 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} style={{ color: "white", margin: 0 }}>
            My Invoice Batches
          </Title>
          <Space>
            <Input
              placeholder="Search batches..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBatches}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <BatchDetailModal
        open={showDetailModal}
        onCancel={handleCloseDetailModal}
        selectedBatch={selectedBatch}
        selectedBatchInvoices={selectedBatchInvoices}
      />

      <IssueTokenModal
        open={showIssueModal}
        onCancel={handleCloseIssueModal}
        onSuccess={handleIssueSuccess}
        selectedBatch={selectedBatch}
      />
    </div>
  );
}
