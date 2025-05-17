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
import { SearchOutlined, EyeOutlined, CheckOutlined } from "@ant-design/icons";
import { InvoiceBatch, Invoice, invoiceBatchApi } from "@/app/utils/apis";
import { message } from "@/app/components/ui/Message";
import BatchDetailModal from "./components/BatchDetailModal";
import ConfirmBatchModal from "./components/ConfirmBatchModal";
import HashText from "@/app/components/ui/HashText";

const { Title } = Typography;

export default function MyProcessingBatchesPage() {
  const { isConnected, address } = useAccount();
  const [batches, setBatches] = useState<InvoiceBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  // const [_, setShowIssueModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  const handleConfirmBatch = (batch: InvoiceBatch) => {
    setSelectedBatch(batch);
    setShowConfirmModal(true);
  };

  // const handleIssueToken = (batch: InvoiceBatch) => {
  //   setSelectedBatch(batch);
  //   setShowIssueModal(true);
  // };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBatch(null);
    setSelectedBatchInvoices([]);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedBatch(null);
  };

  // const handleCloseIssueModal = () => {
  //   // setShowIssueModal(false);
  //   setSelectedBatch(null);
  // };

  const handleConfirmSuccess = () => {
    handleCloseConfirmModal();
    loadBatches(); // Refresh the batch list
  };

  // const handleIssueSuccess = () => {
  //   handleCloseIssueModal();
  //   loadBatches(); // Refresh the batch list
  // };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.id.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.payee.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.payer.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.status.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Payee",
      dataIndex: "payee",
      key: "payee",
      render: (text: string) => <HashText text={text} />,
    },
    {
      title: "Payer",
      dataIndex: "payer",
      key: "payer",
      render: (text: string) => <HashText text={text} />,
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
      render: (text: string) => (text ? text.slice(0, 10) : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: InvoiceBatch) => {
        console.log("record", record);

        return (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>

            {address && record.payer === address && (
              <Tooltip title="Confirm Batch">
                <Button
                  type="text"
                  onClick={() => handleConfirmBatch(record)}
                  icon={<CheckOutlined />}
                  // icon={<SendOutlined rotate={-45} />}
                />
              </Tooltip>
            )}

            {/* {address &&
              record.payer?.toLowerCase() === address.toLowerCase() && (
                <Tooltip title="Issue Token">
                  <Button
                    type="text"
                    onClick={() => handleIssueToken(record)}
                    icon={<SendOutlined rotate={-45} />}
                  />
                </Tooltip>
              )} */}
          </Space>
        );
      },
    },
  ];

  console.log("filteredBatches", filteredBatches);

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

      <ConfirmBatchModal
        open={showConfirmModal}
        onCancel={handleCloseConfirmModal}
        onSuccess={handleConfirmSuccess}
        selectedBatch={selectedBatch}
      />

      {/* <IssueTokenModal
        open={showIssueModal}
        onCancel={handleCloseIssueModal}
        onSuccess={handleIssueSuccess}
        selectedBatch={selectedBatch}
      /> */}
    </div>
  );
}
