"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import AnimatedSection from "../components/AnimatedSection";
import BillForm, { BillFormData } from "../components/BillForm";
import { useInvoice } from "../utils/contracts/useInvoice";
import { useBatchInvoices } from "../utils/contracts/useBatchInvoices";
import { parseEther, formatEther } from "viem";
import {
  Button,
  Table,
  Input,
  Select,
  Modal,
  Typography,
  Space,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import type { InvoiceData } from "../utils/contracts/contractABI";

const { Title, Text } = Typography;
const { Option } = Select;

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

// 默认表单数据
const DEFAULT_BILL_DATA: BillFormData = {
  payer: "",
  amount: "",
  billNumber: "",
  billDate: new Date(),
  billImage: null,
};

export default function PlaygroundPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { useBatchCreateInvoices, useGetInvoice } = useInvoice();
  const {
    loadAllInvoices: fetchAllInvoices,
    getInvoiceDetails,
    isLoading: isBatchLoading,
    error: batchError,
  } = useBatchInvoices();

  const [bills, setBills] = useState<BillFormData[]>([
    { ...DEFAULT_BILL_DATA },
  ]);
  const [queryData, setQueryData] = useState({
    billNumber: "",
    status: statusOptions[0].value,
  });
  const [searchResult, setSearchResult] = useState<InvoiceData | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(
    null
  );
  const [allInvoices, setAllInvoices] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 查询单个发票数据
  const { refetch: refetchQueryInvoice } = useGetInvoice(
    queryData.billNumber,
    queryData.status === "completed",
    !!queryData.billNumber
  );

  // 使用更新后的合约钩子
  const { batchCreateInvoices, isPending, isSuccess, error } =
    useBatchCreateInvoices();

  // 处理成功或错误的消息提示
  useEffect(() => {
    if (isSuccess) {
      message.success("Invoices created successfully");
      setBills([{ ...DEFAULT_BILL_DATA }]);
      // 刷新发票列表
      loadAllInvoices();
    }
    if (error) {
      message.error(`Error: ${error.message}`);
    }
  }, [isSuccess, error]);

  // 使用批量加载的状态
  useEffect(() => {
    if (batchError) {
      message.error(`Error loading invoices: ${batchError.message}`);
    }
  }, [batchError]);

  // 转换合约数据到前端格式
  const transformInvoiceData = (data: {
    invoiceNumber: string;
    payee: `0x${string}`;
    payer: `0x${string}`;
    amount: bigint;
    ipfsHash: string;
    timestamp: bigint;
    dueDate: bigint;
    isValid: boolean;
  }): InvoiceData => ({
    invoice_number: data.invoiceNumber,
    payee: data.payee,
    payer: data.payer,
    amount: data.amount.toString(),
    ipfs_hash: data.ipfsHash,
    contract_hash: "",
    timestamp: data.timestamp.toString(),
    due_date: data.dueDate.toString(),
    token_batch: "",
    is_cleared: false,
    is_valid: data.isValid,
  });

  // 加载所有发票
  const loadAllInvoices = async () => {
    const invoices = await fetchAllInvoices();
    setAllInvoices(invoices);
  };

  // 页面加载时获取所有票据
  useEffect(() => {
    if (isConnected) {
      loadAllInvoices();
    }
  }, [isConnected]);

  const handleAddBill = () => {
    setBills([...bills, { ...DEFAULT_BILL_DATA }]);
  };

  const handleRemoveBill = (index: number) => {
    setBills(bills.filter((_, i) => i !== index));
  };

  const handleBillChange = (index: number, data: BillFormData) => {
    // 仅在开发环境打印日志
    if (process.env.NODE_ENV === "development") {
      console.log(`form ${index} data change:`, data);
    }

    const newBills = [...bills];
    newBills[index] = data;
    setBills(newBills);
  };

  const validateFormData = (data: BillFormData[]): boolean => {
    for (let i = 0; i < data.length; i++) {
      const bill = data[i];
      if (!bill.payer) {
        message.error(`Form #${i + 1}: Payer address cannot be empty`);
        return false;
      }
      if (!/^0x[a-fA-F0-9]{40}$/.test(bill.payer)) {
        message.error(
          `Form #${
            i + 1
          }: Payer address is invalid, must start with 0x and contain 40 characters`
        );
        return false;
      }
      if (!bill.amount) {
        message.error(`Form #${i + 1}: Amount cannot be empty`);
        return false;
      }
      if (!bill.billNumber) {
        message.error(`Form #${i + 1}: Bill number cannot be empty`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address) {
      message.error("Please connect wallet");
      return;
    }

    if (!validateFormData(bills)) {
      return;
    }

    try {
      console.log("submit :", bills);

      const invoices = bills.map((bill) => {
        // Convert timestamps to BigInt first, then to string
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const dueDate = Math.floor(bill.billDate.getTime() / 1000).toString();

        // Ensure amount is a valid string and convert it properly
        const amountString = bill.amount?.trim() || "0";
        let amountInWei;
        try {
          amountInWei = parseEther(amountString);
        } catch (err: unknown) {
          const error = err as Error;
          throw new Error(
            `Invalid amount format for bill ${bill.billNumber}: ${amountString}. Error: ${error.message}`
          );
        }

        // Create invoice with both TypeScript type and ABI compatibility
        const invoice: InvoiceData = {
          invoice_number: bill.billNumber,
          payee: address as `0x${string}`,
          payer: bill.payer as `0x${string}`,
          amount: amountInWei.toString(),
          ipfs_hash: "",
          contract_hash: "",
          timestamp: timestamp,
          due_date: dueDate,
          token_batch: "",
          is_cleared: false,
          is_valid: false,
        };

        // Log the invoice for debugging
        console.log("Prepared invoice:", {
          ...invoice,
          // Also log the ABI format for verification
          abiFormat: {
            invoiceNumber: invoice.invoice_number,
            payee: invoice.payee,
            payer: invoice.payer,
            amount: invoice.amount,
            ipfsHash: invoice.ipfs_hash,
            timestamp: invoice.timestamp,
            dueDate: invoice.due_date,
            isValid: invoice.is_valid,
          },
        });

        return invoice;
      });

      console.log("Submitting invoices:", invoices);
      batchCreateInvoices(invoices);
    } catch (err) {
      console.error("submit error:", err);
      message.error(
        `submit error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const handleQuery = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!queryData.billNumber) {
        // 如果没有输入票据号，加载所有票据
        await loadAllInvoices();
        return;
      }

      console.log("Querying invoice:", queryData.billNumber);
      const result = await refetchQueryInvoice();
      console.log("Query result:", result.data);

      if (result.data) {
        const invoiceData = transformInvoiceData(result.data);
        setSearchResult(invoiceData);
        if (!invoiceData.is_valid) {
          message.warning("This invoice is not valid");
        }
      } else {
        setSearchResult(null);
        message.info("No invoice found with this number");
      }
    } catch (error) {
      console.error("Query error:", error);
      message.error("Failed to query invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInvoice = async (invoiceNumber: string) => {
    const invoice = await getInvoiceDetails(invoiceNumber);
    if (invoice) {
      setSelectedInvoice(invoice);
      setShowInvoiceModal(true);
    }
  };

  const invoiceColumns: ColumnsType<string> = [
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (_, record) => record,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewInvoice(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  // 表格数据源
  const tableData = searchResult ? [searchResult] : allInvoices;

  // 状态过滤
  const filteredData =
    queryData.status === "all"
      ? tableData
      : tableData.filter((invoice) =>
          queryData.status === "completed"
            ? invoice.is_valid
            : !invoice.is_valid
        );

  const searchResultColumns: ColumnsType<InvoiceData> = [
    {
      title: "Bill Number",
      dataIndex: "invoice_number",
      key: "invoice_number",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => formatEther(BigInt(amount)) + " ETH",
    },
    {
      title: "Payee",
      dataIndex: "payee",
      key: "payee",
      render: (address) => `${address.slice(0, 6)}...${address.slice(-4)}`,
    },
    {
      title: "Payer",
      dataIndex: "payer",
      key: "payer",
      render: (address) => `${address.slice(0, 6)}...${address.slice(-4)}`,
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (timestamp) =>
        new Date(Number(timestamp) * 1000).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "is_valid",
      key: "is_valid",
      render: (isValid) => (
        <Tag color={isValid ? "green" : "red"}>
          {isValid ? "Valid" : "Invalid"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewInvoice(record.invoice_number)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-20">
        <AnimatedSection threshold={0.1}>
          {/* Bill Upload Form */}
          <Title level={2} style={{ color: "white", marginBottom: 24 }}>
            Bill Upload
          </Title>

          {/* Wallet Connection */}
          <div className="flex justify-end mb-8">
            {isConnected ? (
              <Space>
                <Text type="secondary">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Text>
                <Button type="primary" danger onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                onClick={() => connect({ connector: injected() })}
              >
                Connect Wallet
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {bills.map((bill, index) => (
              <BillForm
                key={index}
                initialData={bill}
                onSubmit={(data) => handleBillChange(index, data)}
                onRemove={
                  bills.length > 1 ? () => handleRemoveBill(index) : undefined
                }
              />
            ))}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="text"
                onClick={handleAddBill}
                icon={<PlusOutlined />}
                style={{ color: "#1890ff" }}
              >
                Add Bill
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!isConnected || isPending}
                loading={isPending}
              >
                Submit
              </Button>
            </div>
          </form>
        </AnimatedSection>

        {/* Bill Query */}
        <AnimatedSection className="mt-16" threshold={0.1}>
          <Title level={2} style={{ color: "white", marginBottom: 24 }}>
            Bill Query
          </Title>
          <form onSubmit={handleQuery} className="mb-8">
            <Space size="large">
              <Input
                placeholder="Enter bill number"
                value={queryData.billNumber}
                onChange={(e) =>
                  setQueryData({ ...queryData, billNumber: e.target.value })
                }
                style={{ width: 250 }}
              />
              <Select
                value={queryData.status}
                onChange={(value) =>
                  setQueryData({ ...queryData, status: value })
                }
                style={{ width: 150 }}
              >
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
              >
                Search
              </Button>
            </Space>
          </form>

          {/* Query Results */}
          <Table
            loading={isLoading || isBatchLoading}
            columns={searchResultColumns}
            dataSource={filteredData}
            rowKey="invoice_number"
            pagination={false}
            locale={{ emptyText: "No data available" }}
          />
        </AnimatedSection>

        {/* User Invoices */}
        <AnimatedSection className="mt-16" threshold={0.1}>
          <Title level={2} style={{ color: "white", marginBottom: 24 }}>
            My Invoices
          </Title>
          <Button
            type="primary"
            onClick={loadAllInvoices}
            className="mb-6"
            disabled={!isConnected || isBatchLoading}
            loading={isBatchLoading}
          >
            Load My Invoices
          </Button>

          <Table
            loading={isBatchLoading}
            columns={invoiceColumns}
            dataSource={allInvoices.map((invoice) => invoice.invoice_number)}
            rowKey={(record) => record}
            pagination={false}
            locale={{ emptyText: "No invoices found" }}
          />
        </AnimatedSection>

        {/* Invoice Detail Modal */}
        <Modal
          title="Invoice Details"
          open={showInvoiceModal}
          onCancel={() => setShowInvoiceModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowInvoiceModal(false)}>
              Close
            </Button>,
          ]}
        >
          {selectedInvoice && (
            <div>
              <p>
                <strong>Invoice Number:</strong>{" "}
                {selectedInvoice.invoice_number}
              </p>
              <p>
                <strong>Payee:</strong> {selectedInvoice.payee}
              </p>
              <p>
                <strong>Payer:</strong> {selectedInvoice.payer}
              </p>
              <p>
                <strong>Amount:</strong> {selectedInvoice.amount.toString()}
              </p>
              <p>
                <strong>Due Date:</strong>{" "}
                {new Date(
                  Number(selectedInvoice.due_date) * 1000
                ).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedInvoice.is_valid ? "Valid" : "Invalid"}
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
