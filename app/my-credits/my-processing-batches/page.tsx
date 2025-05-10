"use client";
// 我的票据
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
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
// import { invoiceBatchApi, InvoiceBatch, Invoice } from "@/app/utils/apis";
import { InvoiceBatch, Invoice, invoiceBatchApi } from "@/app/utils/apis";
import { message } from "@/app/components/Message";
import dayjs from "dayjs";

const { Title } = Typography;

// Mock data for testing
const mockBatches: InvoiceBatch[] = [
  {
    id: "BATCH001",
    creditor_name: "ABC Company",
    debtor_name: "XYZ Corp",
    invoice_count: 5,
    total_amount: 50000,
    accepted_currency: "USD",
    status: "PENDING",
    created_at: new Date().toISOString(),
    token_batch_id: "",
  },
  {
    id: "BATCH002",
    creditor_name: "DEF Ltd",
    debtor_name: "GHI Inc",
    invoice_count: 3,
    total_amount: 30000,
    accepted_currency: "USD",
    status: "VERIFIED",
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    token_batch_id: "TOKEN001",
  },
  {
    id: "BATCH003",
    creditor_name: "JKL Corp",
    debtor_name: "MNO Ltd",
    invoice_count: 8,
    total_amount: 80000,
    accepted_currency: "USD",
    status: "ISSUED",
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    token_batch_id: "TOKEN002",
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "INV001",
    invoice_number: "INV-2024-001",
    amount: 10000,
    currency: "USD",
    payee: "0x1234...5678",
    payer: "0x8765...4321",
    status: "VERIFIED",
    due_date: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days from now
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    invoice_ipfs_hash: "QmHash1",
    contract_ipfs_hash: "QmHash2",
    token_batch: "BATCH001",
    is_cleared: false,
    is_valid: true,
    blockchain_timestamp: Math.floor(Date.now() / 1000).toString(),
  },
  {
    id: "INV002",
    invoice_number: "INV-2024-002",
    amount: 15000,
    currency: "USD",
    payee: "0x1234...5678",
    payer: "0x8765...4321",
    status: "PENDING",
    due_date: Math.floor(Date.now() / 1000) + 86400 * 45, // 45 days from now
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    invoice_ipfs_hash: "QmHash3",
    contract_ipfs_hash: "QmHash4",
    token_batch: "BATCH001",
    is_cleared: false,
    is_valid: true,
    blockchain_timestamp: "0", // Not yet on blockchain
  },
];

export default function MyProcessingBatchesPage() {
  const { isConnected } = useAccount();
  const [batches, setBatches] = useState<InvoiceBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InvoiceBatch | null>(null);
  const [selectedBatchInvoices, setSelectedBatchInvoices] = useState<Invoice[]>(
    []
  );

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      const response = await invoiceBatchApi.list();
      if (response.code === 200) {
        setBatches(response.data);
      } else {
        message.error(response.msg || "Could not retrieve batches data");
      }

      // Using mock data instead
      // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
      // setBatches(mockBatches);
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
      // Mock API call
      const [batchDetailResponse, invoicesResponse] =
        await invoiceBatchApi.detail(Number(batch.id));
      if (batchDetailResponse.code === 200 && invoicesResponse.code === 200) {
        setSelectedBatch(batch);
        setSelectedBatchInvoices(invoicesResponse.data);
        setShowDetailModal(true);
      } else {
        message.warning("Could not fetch batch details");
      }

      // Using mock data instead
      // await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      // setSelectedBatch(batch);
      // setSelectedBatchInvoices(mockInvoices);
      // setShowDetailModal(true);
    } catch (error) {
      console.error(error);
      message.error("Failed to load batch details");
    }
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.id.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.creditor_name.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.debtor_name.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.status.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBatch(null);
    setSelectedBatchInvoices([]);
  };

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

      {/* Batch Detail Modal */}
      <Modal
        destroyOnClose
        title="Batch Details"
        open={showDetailModal}
        onCancel={handleCloseDetailModal}
        width={1000}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Close
          </Button>,
        ]}
      >
        {selectedBatch && (
          <>
            <Descriptions
              styles={{ label: { fontWeight: "bold" } }}
              bordered
              column={2}
              size="small"
              className="mb-6"
            >
              <Descriptions.Item label="Batch ID" span={2}>
                {selectedBatch.id}
              </Descriptions.Item>
              <Descriptions.Item label="Creditor">
                {selectedBatch.creditor_name}
              </Descriptions.Item>
              <Descriptions.Item label="Debtor">
                {selectedBatch.debtor_name}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                {selectedBatch.accepted_currency}{" "}
                {Number(selectedBatch.total_amount).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Invoice Count">
                {selectedBatch.invoice_count}
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
              <Descriptions.Item label="Created At" span={2}>
                {dayjs(selectedBatch.created_at).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
              <Descriptions.Item label="Token Batch ID" span={2}>
                {selectedBatch.token_batch_id || "Not available"}
              </Descriptions.Item>
            </Descriptions>

            <Title
              level={5}
              style={{
                // textAlign: "center",
                color: "#e3e3e3ee",
                marginBottom: 10,
              }}
            >
              Invoices in this Batch
            </Title>
            <Table
              columns={[
                {
                  title: "Invoice Number",
                  dataIndex: "invoice_number",
                  key: "invoice_number",
                },
                {
                  title: "Amount",
                  dataIndex: "amount",
                  key: "amount",
                  render: (amount: number, record: Invoice) =>
                    `${record.currency} ${Number(amount).toLocaleString()}`,
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
                  render: (timestamp: number) =>
                    dayjs(timestamp * 1000).format("YYYY-MM-DD HH:mm"),
                },
              ]}
              dataSource={selectedBatchInvoices}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
