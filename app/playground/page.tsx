"use client";

import { useState, FormEvent } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import AnimatedSection from "../components/AnimatedSection";
import BillForm, { BillFormData } from "../components/BillForm";
import { useInvoice } from "../utils/contracts/useInvoice";
import { parseEther } from "viem";
import { useWriteContract, useReadContract } from "wagmi";
import {
  Button,
  Table,
  Input,
  Select,
  Modal,
  Typography,
  Space,
  Tag,
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

export default function PlaygroundPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { contractAddress, contractAbi, getInvoice } = useInvoice();

  const [bills, setBills] = useState<BillFormData[]>([]);
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

  const { writeContract } = useWriteContract();

  const { data: userInvoicesData } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "getUserInvoices",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const handleAddBill = () => {
    setBills([
      ...bills,
      {
        payer: "",
        amount: "",
        billNumber: "",
        billDate: new Date(),
        billImage: null,
      },
    ]);
  };

  const handleRemoveBill = (index: number) => {
    setBills(bills.filter((_, i) => i !== index));
  };

  const handleBillChange = (index: number, data: BillFormData) => {
    const newBills = [...bills];
    newBills[index] = data;
    setBills(newBills);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address) return;

    const invoices = bills.map((bill) => {
      if (!bill.payer) throw new Error("Payer address is required");
      return {
        invoiceNumber: bill.billNumber,
        payee: address,
        payer: bill.payer as `0x${string}`,
        amount: parseEther(bill.amount),
        ipfsHash: "", // TODO: Upload to IPFS
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
        dueDate: BigInt(Math.floor(bill.billDate.getTime() / 1000)),
        isValid: true,
      };
    });

    await writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: "batchCreateInvoices",
      args: [invoices],
    });
  };

  const handleQuery = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!queryData.billNumber) return;

    const invoiceData = getInvoice(queryData.billNumber, true);
    if (invoiceData.data) {
      setSearchResult(invoiceData.data as unknown as InvoiceData);
    }
  };

  const handleGetUserInvoices = () => {
    if (!address || !userInvoicesData) return;
    setUserInvoices([...(userInvoicesData as string[])]);
  };

  const handleViewInvoice = async (invoiceNumber: string) => {
    try {
      const invoiceResult = getInvoice(invoiceNumber, true);
      if (invoiceResult.data) {
        setSelectedInvoice(invoiceResult.data as unknown as InvoiceData);
        setShowInvoiceModal(true);
      }
    } catch (error) {
      console.error("Error viewing invoice:", error);
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
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => amount.toString(),
    },
    {
      title: "Status",
      dataIndex: "isValid",
      key: "isValid",
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
          onClick={() => handleViewInvoice(record.invoiceNumber)}
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
              <Button type="primary" htmlType="submit" disabled={!isConnected}>
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
            rowKey="invoiceNumber"
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
                <strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber}
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
                  Number(selectedInvoice.dueDate) * 1000
                ).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedInvoice.isValid ? "Valid" : "Invalid"}
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
