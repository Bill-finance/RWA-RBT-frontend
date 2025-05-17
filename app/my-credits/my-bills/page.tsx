"use client";
import { useInvoice } from "@/app/utils/contracts/useInvoice";
import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Button, Table, Input, Typography, Space, Card } from "antd";
import { SearchOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import { invoiceApi, Invoice } from "@/app/utils/apis";
import { message } from "@/app/components/Message";
import CreateInvoiceModal from "./components/CreateInvoiceModal";
import CreateTokenBatchModal from "./components/CreateTokenBatchModal";
import { ColumnsType } from "antd/es/table";
import { getTableColumns, loadInvoices } from "./utils";
import InvoiceDetailModal from "./components/InvoiceDetailModal";

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
  const { address } = useAccount();

  const { useBatchCreateInvoices } = useInvoice();
  const { batchCreateInvoices } = useBatchCreateInvoices({
    onSuccess: () => {
      updateToBackend();
    },
  });

  const handleIssueInvoices = async () => {
    if (selectedInvoices.length === 0) {
      message.warning("Please select at least one invoice to issue");
      return;
    }
    setShowTokenBatchModal(true);
  };

  const handleVerify = async (invoiceNumber: string, id: string) => {
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
        if (error !== null) {
          message.error("User cancelled the transaction");
          // 用户取消时也需要清除 loading 状态
          setProcessingIds(processingIds.filter((pid) => pid !== id));
          return;
        }
        throw error; // 重新抛出其他错误
      }
    } catch (error) {
      console.error(error);
      // 发生错误时清除 loading 状态
      setProcessingIds(processingIds.filter((pid) => pid !== id));
    }
  };

  // 交易完成后上报
  const updateToBackend = useCallback(async () => {
    const currentProcessingId = processingIds[0];
    if (!currentProcessingId) return;

    try {
      const response = await invoiceApi.verify(currentProcessingId);
      if (response.code === 0 || response.code === 200) {
        await loadInvoices({ setIsLoading, setInvoices });
      } else {
        throw new Error(response.msg || "Failed to verify invoice");
      }
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Failed to verify invoice"
      );
    }

    setProcessingIds((prev) => prev.filter((id) => id !== currentProcessingId));
  }, [setProcessingIds, setIsLoading, setInvoices, processingIds]);

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

  const handleCheck = (e, record) => {
    if (e.target.checked) {
      setSelectedInvoices([...selectedInvoices, record.id]);
    } else {
      setSelectedInvoices(selectedInvoices.filter((id) => id !== record.id));
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadInvoices({ setIsLoading, setInvoices });
    }
  }, [isConnected]);

  useEffect(() => {
    if (selectedInvoices.length > 0 && processingIds.length > 0) {
      const timer = setTimeout(() => {
        console.log(`Monitoring invoices: ${selectedInvoices.join(", ")}`);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [selectedInvoices, processingIds]);

  const columns = getTableColumns({
    processingIds,
    address,
    selectedInvoices,
    handleCheck,
    handleViewDetail,
    handleVerify,
  });

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
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
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

      {/* 查看票据细节 */}
      <InvoiceDetailModal
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedInvoice(null);
        }}
        selectedInvoice={selectedInvoice}
      />

      {/* 创建票据 */}
      <CreateInvoiceModal
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
        }}
        onSuccess={() => {
          setShowCreateModal(false);
          loadInvoices({ setIsLoading, setInvoices });
        }}
      />

      {/* 创建票据打包批次 */}
      <CreateTokenBatchModal
        open={showTokenBatchModal}
        onCancel={() => {
          setShowTokenBatchModal(false);
        }}
        selectedInvoices={selectedInvoices}
        invoiceNumbers={invoices
          .filter((inv) => selectedInvoices.includes(inv.id))
          .map((inv) => inv.invoice_number)}
        onSuccess={() => {
          loadInvoices({ setIsLoading, setInvoices });
        }}
        setProcessingIds={setProcessingIds}
        processingIds={processingIds}
      />
    </div>
  );
}
