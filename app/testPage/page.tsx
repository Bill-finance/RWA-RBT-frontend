"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  Button,
  Table,
  Typography,
  Space,
  Tag,
  message,
  Modal,
  Popconfirm,
} from "antd";
// import { SearchOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { authApi, enterpriseApi, invoiceApi, userApi } from "../utils/apis";

const { Title, Text } = Typography;

interface Enterprise {
  _id: string;
  name: string;
  walletAddress: string;
  status?: string;
  kycDetailsIpfsHash?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EnterpriseResponse {
  id: string;
  name: string;
  wallet_address: string;
  status: string;
  kyc_details_ipfs_hash: string | null;
  created_at: {
    $date: {
      $numberLong: string;
    };
  };
  updated_at: {
    $date: {
      $numberLong: string;
    };
  };
}

interface EnterpriseListResponse {
  code: number;
  data: EnterpriseResponse[];
  msg: string;
}

interface Invoice {
  _id: string;
  invoice_number: string;
  creditor_id: string;
  debtor_id: string;
  amount: number;
  currency: string;
  due_date: string;
  status: string;
  ipfs_hash: string;
  batch_id: string | null;
  created_at: string;
  updated_at: string;
  payee: string;
  payer: string;
  contract_hash: string;
  blockchain_timestamp: string;
  token_batch: string;
  is_cleared: boolean;
  is_valid: boolean;
}

interface InvoiceResponse {
  id: string;
  invoice_number: string;
  creditor_id: string;
  debtor_id: string;
  amount: number;
  currency: string;
  due_date: {
    $date: {
      $numberLong: string;
    };
  };
  status: string;
  ipfs_hash: string;
  batch_id: string | null;
  created_at: {
    $date: {
      $numberLong: string;
    };
  };
  updated_at: {
    $date: {
      $numberLong: string;
    };
  };
  payee: string;
  payer: string;
  contract_hash: string;
  blockchain_timestamp: string;
  token_batch: string;
  is_cleared: boolean;
  is_valid: boolean;
}

interface InvoiceListResponse {
  code: number;
  data: InvoiceResponse[];
  msg: string;
}

interface InvoiceCreateRequest {
  invoice_number: string;
  creditor_id: string;
  debtor_id: string;
  amount: number;
  currency: string;
  due_date: string;
  status: string;
  ipfs_hash: string;
  payee: string;
  payer: string;
}

interface EnterpriseCreateRequest {
  name: string;
  walletAddress: string;
}

interface EnterpriseUpdateRequest {
  name?: string;
  walletAddress?: string;
  status?: string;
  kycDetailsIpfsHash?: string;
}

export default function TestPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessage } = useSignMessage();
  const [mounted, setMounted] = useState(false);

  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedEnterprise, setSelectedEnterprise] =
    useState<Enterprise | null>(null);
  // const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [challengeData, setChallengeData] = useState<{
    nonce: string;
    requestId: string;
  } | null>(null);
  const [enterpriseDetail, setEnterpriseDetail] = useState<Enterprise | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 监听登录状态变化，自动加载数据
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadEnterprises();
      loadInvoices();
    }
  }, [localStorage.getItem("token")]);

  // 认证相关
  const handleGenerateChallenge = async () => {
    if (!address) {
      message.error("Please connect wallet first");
      return;
    }
    try {
      const response = await authApi.generateChallenge({ address });
      setChallengeData(response);
      message.success(`Challenge generated: ${response.nonce}`);
    } catch (error) {
      message.error("Failed to generate challenge");
    }
  };

  const handleLogin = async () => {
    if (!address || !challengeData) {
      message.error("Please generate challenge first");
      return;
    }
    try {
      // 使用 wagmi 的 signMessage
      const signature = await signMessage({ message: challengeData.nonce });

      const response = await authApi.login({
        requestId: challengeData.requestId,
        signature,
      });

      // 存储 token
      localStorage.setItem("token", response.token);
      message.success("Login successful");
    } catch (error) {
      message.error("Failed to login");
    }
  };

  // 企业相关
  const loadEnterprises = async () => {
    if (!localStorage.getItem("token")) {
      message.error("Please login first");
      return;
    }
    try {
      setIsLoading(true);
      const response = await enterpriseApi.list();
      if (response?.code === 200 && Array.isArray(response.data)) {
        const formattedData = response.data.map((item: EnterpriseResponse) => ({
          _id: item.id,
          name: item.name,
          walletAddress: item.wallet_address,
          status: item.status,
          kycDetailsIpfsHash: item.kyc_details_ipfs_hash,
          createdAt: new Date(
            Number(item.created_at.$date.$numberLong)
          ).toLocaleString("en-US"),
          updatedAt: new Date(
            Number(item.updated_at.$date.$numberLong)
          ).toLocaleString("en-US"),
        }));
        setEnterprises(formattedData);
      } else {
        setEnterprises([]);
        message.error("Invalid response format");
      }
    } catch (error: any) {
      message.error(error.message || "Failed to load enterprises");
      setEnterprises([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEnterprise = async () => {
    if (!address || !localStorage.getItem("token")) {
      message.error("Please connect wallet and login first");
      return;
    }
    try {
      setIsLoading(true);
      const enterpriseData: EnterpriseCreateRequest = {
        name: `Enterprise-${Date.now()}`,
        walletAddress: address,
      };

      await enterpriseApi.create(enterpriseData);
      message.success("Enterprise created successfully");
      loadEnterprises();
    } catch (error: any) {
      message.error(error.message || "Failed to create enterprise");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEnterprise = async (id: string) => {
    try {
      setIsLoading(true);
      await enterpriseApi.delete(id);
      message.success("Enterprise deleted successfully");
      loadEnterprises();
    } catch (error: any) {
      message.error(error.message || "Failed to delete enterprise");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEnterprise = async (id: string) => {
    try {
      setIsLoading(true);
      const updateData: EnterpriseUpdateRequest = {
        name: `Enterprise-${Math.floor(Math.random() * 1000)}`,
        walletAddress: address || "",
        status: "verified",
        kycDetailsIpfsHash: "QmPlaceholder", // This should be replaced with actual IPFS hash
      };

      await enterpriseApi.update(id, updateData);
      message.success("Enterprise updated successfully");
      loadEnterprises();
    } catch (error: any) {
      message.error(error.message || "Failed to update enterprise");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await enterpriseApi.getById(id);
      if (response?.code === 200) {
        const detail = {
          _id: response.data.id,
          name: response.data.name,
          walletAddress: response.data.wallet_address,
          status: response.data.status,
          kycDetailsIpfsHash: response.data.kyc_details_ipfs_hash,
          createdAt: new Date(
            Number(response.data.created_at.$date.$numberLong)
          ).toLocaleString(),
          updatedAt: new Date(
            Number(response.data.updated_at.$date.$numberLong)
          ).toLocaleString(),
        };
        setEnterpriseDetail(detail);
        setShowDetailModal(true);
      }
    } catch (error: any) {
      message.error(error.message || "Failed to load enterprise details");
    } finally {
      setIsLoading(false);
    }
  };

  // 发票相关
  const loadInvoices = async () => {
    if (!localStorage.getItem("token")) {
      message.error("Please login first");
      return;
    }
    try {
      setIsLoading(true);
      const response = await invoiceApi.list();
      if (response?.code === 200 && Array.isArray(response.data)) {
        const formattedData = response.data.map((item: InvoiceResponse) => ({
          _id: item.id,
          invoice_number: item.invoice_number,
          creditor_id: item.creditor_id,
          debtor_id: item.debtor_id,
          amount: item.amount,
          currency: item.currency,
          due_date: new Date(
            Number(item.due_date.$date.$numberLong)
          ).toLocaleString(),
          status: item.status,
          ipfs_hash: item.ipfs_hash,
          batch_id: item.batch_id,
          created_at: new Date(
            Number(item.created_at.$date.$numberLong)
          ).toLocaleString(),
          updated_at: new Date(
            Number(item.updated_at.$date.$numberLong)
          ).toLocaleString(),
          payee: item.payee,
          payer: item.payer,
          contract_hash: item.contract_hash,
          blockchain_timestamp: item.blockchain_timestamp,
          token_batch: item.token_batch,
          is_cleared: item.is_cleared,
          is_valid: item.is_valid,
        }));
        setInvoices(formattedData);
      } else {
        setInvoices([]);
        message.error("Invalid response format");
      }
    } catch (error: any) {
      message.error(error.message || "Failed to load invoices");
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!address || !localStorage.getItem("token")) {
      message.error("Please connect wallet and login first");
      return;
    }
    try {
      setIsLoading(true);
      const invoiceData: InvoiceCreateRequest = {
        invoice_number: `INV-${Date.now()}`,
        creditor_id: address, // Using connected wallet as creditor
        debtor_id: "0x0000000000000000000000000000000000000000", // Placeholder debtor address
        amount: 1000,
        currency: "USD",
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: "pending",
        ipfs_hash: "QmPlaceholder", // This should be replaced with actual IPFS hash
        payee: address,
        payer: "0x0000000000000000000000000000000000000000", // Placeholder payer address
      };

      await invoiceApi.create(invoiceData);
      message.success("Invoice created successfully");
      await loadInvoices();
    } catch (error: any) {
      message.error(error.message || "Failed to create invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      setIsLoading(true);
      await invoiceApi.delete(id);
      message.success("Invoice deleted successfully");
      await loadInvoices();
    } catch (error: any) {
      message.error(error.message || "Failed to delete invoice");
    } finally {
      setIsLoading(false);
    }
  };

  // 用户相关
  const handleBindEnterprise = async () => {
    if (!address || !selectedEnterprise || !localStorage.getItem("token")) {
      message.error(
        "Please connect wallet, select an enterprise and login first"
      );
      return;
    }
    try {
      await userApi.bindEnterprise({
        enterpriseAddress: selectedEnterprise.walletAddress,
      });
      message.success("Successfully bound to enterprise");
    } catch (error) {
      message.error("Failed to bind enterprise");
    }
  };

  const enterpriseColumns: ColumnsType<Enterprise> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Wallet Address",
      dataIndex: "walletAddress",
      key: "walletAddress",
      render: (address) => `${address.slice(0, 6)}...${address.slice(-4)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Verified" ? "green" : "orange"}>
          {status || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetail(record._id)}>
            View Details
          </Button>
          <Button
            type="link"
            onClick={() => handleUpdateEnterprise(record._id)}
          >
            Update
          </Button>
          <Popconfirm
            title="Are you sure to delete this enterprise?"
            onConfirm={() => handleDeleteEnterprise(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const invoiceColumns: ColumnsType<Invoice> = [
    {
      title: "Invoice Number",
      dataIndex: "invoice_number",
      key: "invoice_number",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => `${amount} ${record.currency}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "verified" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: () => 123,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Are you sure to delete this invoice?"
            onConfirm={() => handleDeleteInvoice(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-20">
        {/* Wallet Connection */}
        <div className="flex justify-end mb-8">
          {mounted &&
            (isConnected ? (
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
            ))}
        </div>

        {/* Authentication Section */}
        <div className="mb-8">
          <Title level={2} style={{ color: "white", marginBottom: 24 }}>
            Authentication
          </Title>
          {mounted && (
            <Space>
              <Button onClick={handleGenerateChallenge} disabled={!isConnected}>
                Generate Challenge
              </Button>
              <Button
                onClick={handleLogin}
                disabled={!isConnected || !challengeData}
              >
                Login
              </Button>
            </Space>
          )}
        </div>

        {/* Enterprise Section */}
        <div className="mb-8">
          <Title level={2} style={{ color: "white", marginBottom: 24 }}>
            Enterprise Management
          </Title>
          {mounted && (
            <>
              <Space className="mb-4">
                <Button
                  onClick={handleCreateEnterprise}
                  disabled={!isConnected}
                >
                  Create Enterprise
                </Button>
                <Button onClick={loadEnterprises}>Load Enterprises</Button>
              </Space>
              <Table
                columns={enterpriseColumns}
                dataSource={enterprises}
                rowKey="_id"
                pagination={false}
              />
            </>
          )}
        </div>

        {/* Invoice Section */}
        <div className="mb-8">
          <Title level={2} style={{ color: "white", marginBottom: 24 }}>
            Invoice Management
          </Title>
          {mounted && (
            <>
              <Space className="mb-4">
                <Button onClick={handleCreateInvoice} disabled={!isConnected}>
                  Create Invoice
                </Button>
                <Button onClick={loadInvoices}>Load Invoices</Button>
              </Space>
              <Table
                columns={invoiceColumns}
                dataSource={invoices}
                rowKey="_id"
                pagination={false}
              />
            </>
          )}
        </div>

        {/* User Section */}
        <div className="mb-8">
          <Title level={2} style={{ color: "white", marginBottom: 24 }}>
            User Management
          </Title>
          {mounted && (
            <Button
              onClick={handleBindEnterprise}
              disabled={!isConnected || !selectedEnterprise}
            >
              Bind to Selected Enterprise
            </Button>
          )}
        </div>

        {/* Enterprise Detail Modal */}
        <Modal
          title="Enterprise Details"
          open={showDetailModal}
          onCancel={() => setShowDetailModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowDetailModal(false)}>
              Close
            </Button>,
          ]}
        >
          {enterpriseDetail && (
            <div>
              <p>
                <strong>ID:</strong> {enterpriseDetail._id}
              </p>
              <p>
                <strong>Name:</strong> {enterpriseDetail.name}
              </p>
              <p>
                <strong>Wallet Address:</strong>{" "}
                {enterpriseDetail.walletAddress}
              </p>
              <p>
                <strong>Status:</strong> {enterpriseDetail.status || "Pending"}
              </p>
              <p>
                <strong>KYC IPFS Hash:</strong>{" "}
                {enterpriseDetail.kycDetailsIpfsHash || "N/A"}
              </p>
              <p>
                <strong>Created At:</strong> {enterpriseDetail.createdAt}
              </p>
              <p>
                <strong>Updated At:</strong> {enterpriseDetail.updatedAt}
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
