"use client";
import { useInvoice } from "@/app/utils/contracts/useInvoice";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAccount } from "wagmi";
import { Button, Table, Input, Typography, Space, Card } from "antd";
import { SearchOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import { invoiceApi, Invoice } from "@/app/utils/apis";
import { message } from "@/app/components/ui/Message";
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
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const processingIdsRef = useRef<string[]>([]);
  const { address } = useAccount();

  // 更新 ref 当 processingIds 变化时
  useEffect(() => {
    processingIdsRef.current = processingIds;
  }, [processingIds]);

  const { useBatchCreateInvoices } = useInvoice();
  const { batchCreateInvoices } = useBatchCreateInvoices({
    onSuccess: () => {
      // ✅ 正确触发
      console.log("batchCreateInvoices onSuccess", processingIdsRef.current);
      if (processingIdsRef.current.length > 0) {
        updateToBackend(processingIdsRef.current[0]);
      } else {
        console.warn("No processing IDs available in onSuccess callback");
      }
      setProcessingIds([]);
    },
    onError: (error) => {
      // ✅ 正确触发，只是有一些延迟
      setProcessingIds([]);
      console.error(error);
    },
  });

  const handleIssueInvoices = async () => {
    if (selectedInvoices.length === 0) {
      message.warning("Please select at least one invoice to issue");
      return;
    }
    setShowTokenBatchModal(true);
  };

  const handleVerify = async (invoiceNumber: string, invoiceId: string) => {
    setProcessingIds([...processingIds, invoiceId]);
    setSelectedInvoices(selectedInvoices.filter((inv) => inv.id !== invoiceId));

    try {
      // 1. 获取票据详情
      const res = await invoiceApi.detail(invoiceNumber);
      if (!res || res.code !== 200) {
        throw new Error("Invoice not found");
      }
      const invoice = res.data[0];

      // 2. 准备合约数据
      const invoiceParams = {
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

      console.log("invoiceParams", invoiceParams);

      // 3. 调用合约的 batchCreateInvoices 函数
      await batchCreateInvoices([invoiceParams]);
    } catch (error) {
      console.error(error);
    }
  };

  // 交易完成后上报
  const updateToBackend = useCallback(
    async (currentProcessingId: string) => {
      try {
        const response = await invoiceApi.verify(currentProcessingId);
        if (response.code === 0 || response.code === 200) {
          await loadInvoices({ setIsLoading, setInvoices });
        } else {
          throw new Error(response.msg || "Failed to verify invoice");
        }
      } catch (error) {
        message.error("Failed to verify invoice");
        console.error("updateToBackend error", error);
      }
    },
    [setIsLoading, setInvoices]
  );

  const handleViewDetail = async (invoice: Invoice) => {
    try {
      const response = await invoiceApi.detail(invoice.invoice_number);
      if (response.code === 200 && response.data[0]) {
        setSelectedInvoices([{ ...invoice, ...response.data[0] }]);
      } else {
        setSelectedInvoices([invoice]);
        message.warning("Could not fetch latest blockchain status");
      }
      setShowDetailModal(true);
    } catch (error) {
      console.error(error);
      message.error("Failed to load invoice details");
      setSelectedInvoices([invoice]);
      setShowDetailModal(true);
    }
    // finally {
    // setProcessingIds([]);
    // }
  };

  const handleCheck = (e, record) => {
    if (e.target.checked) {
      setSelectedInvoices([...selectedInvoices, record]);
    } else {
      setSelectedInvoices(selectedInvoices.filter((id) => id !== record.id));
    }
  };

  useEffect(() => {
    if (isConnected) {
      loadInvoices({ setIsLoading, setInvoices });
    }
  }, [isConnected]);

  const columns = getTableColumns({
    processingIds,
    address,
    selectedInvoices,
    handleCheck,
    handleViewDetail,
    handleVerify,
  });

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchText.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchText.toLowerCase())
  );

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
              loading={selectedInvoices.some((inv) =>
                processingIds.includes(inv.id)
              )}
              disabled={
                selectedInvoices.length === 0 ||
                selectedInvoices.some((inv) => processingIds.includes(inv.id))
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
          setSelectedInvoices([]);
        }}
        selectedInvoices={selectedInvoices}
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
          setProcessingIds([]);
        }}
      />

      {/* 创建票据打包批次 */}
      <CreateTokenBatchModal
        open={showTokenBatchModal}
        onCancel={() => {
          setShowTokenBatchModal(false);
        }}
        selectedInvoices={selectedInvoices}
        onSuccess={() => {
          setShowTokenBatchModal(false);
          loadInvoices({ setIsLoading, setInvoices });
          setProcessingIds([]);
        }}
        setProcessingIds={setProcessingIds}
        processingIds={processingIds}
      />
    </div>
  );
}
