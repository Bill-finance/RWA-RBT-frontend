"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import AnimatedSection from "../components/AnimatedSection";
import BillForm, { BillFormData } from "../components/BillForm";
import { useInvoice } from "../utils/contracts/useInvoice";
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
  const { useBatchCreateInvoices, useGetInvoice, useGetCurrentUserInvoices } =
    useInvoice();

  // 使用保存完整billData对象的数组，而不是只存储索引
  const [bills, setBills] = useState<BillFormData[]>([
    { ...DEFAULT_BILL_DATA },
  ]);

  const [queryData, setQueryData] = useState({
    billNumber: "",
    status: statusOptions[0].value,
  });

  const [userInvoices, setUserInvoices] = useState<string[]>([]);
  const [searchResult, setSearchResult] = useState<InvoiceData | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(
    null
  );
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState<
    string | undefined
  >(undefined);

  // 使用更新后的合约钩子
  const { batchCreateInvoices, isPending, isSuccess, error } =
    useBatchCreateInvoices();
  const { data: userInvoicesData } = useGetCurrentUserInvoices();

  // 查询单个发票数据
  const { data: queryInvoiceData, refetch: refetchQueryInvoice } =
    useGetInvoice(queryData.billNumber, true, false);

  // 查看发票详情
  const { data: viewInvoiceData, refetch: refetchViewInvoice } = useGetInvoice(
    currentInvoiceNumber,
    true,
    !!currentInvoiceNumber
  );

  // 处理成功或错误的消息提示
  useEffect(() => {
    if (isSuccess) {
      message.success("Invoices created successfully");
      setBills([{ ...DEFAULT_BILL_DATA }]);
    }
    if (error) {
      message.error(`Error: ${error.message}`);
    }
  }, [isSuccess, error]);

  // 加载用户发票列表
  useEffect(() => {
    if (userInvoicesData) {
      setUserInvoices([...(userInvoicesData as string[])]);
    }
  }, [userInvoicesData]);

  // 监听发票详情数据变化
  useEffect(() => {
    if (viewInvoiceData && currentInvoiceNumber) {
      setSelectedInvoice(viewInvoiceData as unknown as InvoiceData);
      setShowInvoiceModal(true);
    }
  }, [viewInvoiceData, currentInvoiceNumber]);

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
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const dueDate = Math.floor(bill.billDate.getTime() / 1000).toString();

        return {
          invoice_number: bill.billNumber,
          payee: address as `0x${string}`,
          payer: bill.payer as `0x${string}`,
          amount: parseEther(bill.amount).toString(), // 转换为 wei 字符串
          ipfs_hash: "",
          contract_hash: "",
          timestamp: timestamp,
          due_date: dueDate,
          token_batch: "",
          is_cleared: false,
          is_valid: false,
        };
      });

      batchCreateInvoices(invoices);
    } catch (err) {
      console.error("submit error:", err);
      message.error(
        `submit error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const handleQuery = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!queryData.billNumber) return;

    refetchQueryInvoice().then(() => {
      if (queryInvoiceData) {
        setSearchResult(queryInvoiceData as unknown as InvoiceData);
      }
    });
  };

  const handleGetUserInvoices = () => {
    // 数据已通过useEffect自动更新到userInvoices
  };

  const handleViewInvoice = async (invoiceNumber: string) => {
    try {
      // 更新当前查询的发票号码并获取数据
      setCurrentInvoiceNumber(invoiceNumber);
      refetchViewInvoice();
    } catch (error) {
      console.error("Error viewing invoice:", error);
      message.error("Failed to fetch invoice details");
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
      render: (amount) => formatEther(BigInt(amount)),
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
            columns={searchResultColumns}
            dataSource={searchResult ? [searchResult] : []}
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
            onClick={handleGetUserInvoices}
            className="mb-6"
            disabled={!isConnected}
          >
            Load My Invoices
          </Button>

          <Table
            columns={invoiceColumns}
            dataSource={userInvoices}
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
