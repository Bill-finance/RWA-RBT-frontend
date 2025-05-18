"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Table, Input, Typography, Space, Card } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { InvoiceBatch, Invoice, invoiceBatchApi } from "@/app/utils/apis";
import { message } from "@/app/components/ui/Message";
import BatchDetailModal from "./components/BatchDetailModal";
import ConfirmBatchModal from "./components/ConfirmBatchModal";
import { getTableColumns } from "./utils";

const { Title } = Typography;

export default function MyProcessingBatchesPage() {
  const { isConnected, address } = useAccount();
  const [batches, setBatches] = useState<InvoiceBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
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

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBatch(null);
    setSelectedBatchInvoices([]);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedBatch(null);
  };

  const handleConfirmSuccess = () => {
    handleCloseConfirmModal();
    loadBatches(); // Refresh the batch list
  };

  // TODO: 暂时使用前端搜索
  const filteredBatches = batches.filter(
    (batch) =>
      batch.id.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.payee.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.payer.toLowerCase().includes(searchText.toLowerCase()) ||
      batch.status.toLowerCase().includes(searchText.toLowerCase())
  );

  // TODO: 其他页面也需要注意这个问题，切换钱包后要刷新一次
  useEffect(() => {
    if (isConnected) {
      loadBatches();
    }
  }, [isConnected]);

  const columns = getTableColumns({
    address,
    handleViewDetail,
    handleConfirmBatch,
  });

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
