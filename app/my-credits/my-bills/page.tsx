"use client";

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
  message,
  Card,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock data for bills
interface Bill {
  id: string;
  billNumber: string;
  debtor: string;
  amount: number;
  isOnChain: boolean;
  isCleared: boolean;
  tokenBatchCode: string | null;
  createdAt: string;
}

const generateMockBills = (): Bill[] => {
  return Array.from({ length: 10 }, (_, index) => ({
    id: `b-${index + 1}`,
    billNumber: `BILL-${(index + 1).toString().padStart(4, "0")}`,
    debtor: `0x${Math.random().toString(16).slice(2, 40)}`,
    amount: Math.floor(Math.random() * 10000) + 1000,
    isOnChain: Math.random() > 0.5,
    isCleared: Math.random() > 0.7,
    tokenBatchCode: Math.random() > 0.5 ? `BATCH-${index + 1}` : null,
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
  }));
};

export default function MyBillsPage() {
  const { address, isConnected } = useAccount();
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [showTokenizeModal, setShowTokenizeModal] = useState(false);

  // Load bills when component mounts
  useEffect(() => {
    const loadBills = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with an actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // const res = await get;
        setBills(generateMockBills());
      } catch (error) {
        message.error("Failed to load bills");
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      loadBills();
    }
  }, [isConnected]);

  const columns = [
    {
      title: "Select",
      key: "select",
      render: (_: any, record: Bill) => (
        <input
          type="checkbox"
          checked={selectedBills.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedBills([...selectedBills, record.id]);
            } else {
              setSelectedBills(selectedBills.filter((id) => id !== record.id));
            }
          }}
        />
      ),
    },
    {
      title: "Bill Number",
      dataIndex: "billNumber",
      key: "billNumber",
      render: (text: string, record: Bill) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: "Debtor",
      dataIndex: "debtor",
      key: "debtor",
      render: (text: string) => `${text.slice(0, 6)}...${text.slice(-4)}`,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text: number) => `$${text.toLocaleString()}`,
    },
    {
      title: "On Chain",
      dataIndex: "isOnChain",
      key: "isOnChain",
      render: (text: boolean) => (
        <Tag color={text ? "green" : "orange"}>{text ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Cleared",
      dataIndex: "isCleared",
      key: "isCleared",
      render: (text: boolean) => (
        <Tag color={text ? "green" : "red"}>{text ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Token Batch",
      dataIndex: "tokenBatchCode",
      key: "tokenBatchCode",
      render: (text: string | null) => text || "-",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Bill) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              disabled={record.isOnChain}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.isOnChain}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
          <Tooltip title="Upload to Blockchain">
            <Button
              type="text"
              icon={<UploadOutlined />}
              disabled={record.isOnChain}
              onClick={() => handleUploadToBlockchain(record)}
            />
          </Tooltip>
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    message.success("Bill deleted successfully");
    setBills(bills.filter((bill) => bill.id !== id));
  };

  const handleUploadToBlockchain = (bill: Bill) => {
    message.success("Bill uploaded to blockchain successfully");
    setBills(
      bills.map((b) => (b.id === bill.id ? { ...b, isOnChain: true } : b))
    );
  };

  const handleViewDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setShowDetailModal(true);
  };

  const handleTokenize = () => {
    if (selectedBills.length === 0) {
      message.warning("Please select bills to tokenize");
      return;
    }
    setShowTokenizeModal(true);
  };

  const filteredBills = bills.filter(
    (bill) =>
      bill.billNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      bill.debtor.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-zinc-900 border-zinc-800 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} style={{ color: "white", margin: 0 }}>
            Bill Management
          </Title>
          <Space>
            <Input
              placeholder="Search bills..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Bill
            </Button>
            <Button
              type="primary"
              icon={<FileDoneOutlined />}
              onClick={handleTokenize}
              disabled={selectedBills.length === 0}
            >
              Tokenize Selected
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBills}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add/Edit Bill Modal */}
      <Modal
        title={selectedBill ? "Edit Bill" : "Add New Bill"}
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          setSelectedBill(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setShowAddModal(false);
              setSelectedBill(null);
            }}
          >
            Cancel
          </Button>,
          <Button key="submit" type="primary">
            {selectedBill ? "Save Changes" : "Add Bill"}
          </Button>,
        ]}
      >
        <p>Form content would go here</p>
      </Modal>

      {/* Bill Detail Modal */}
      <Modal
        title="Bill Details"
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedBill(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setShowDetailModal(false);
              setSelectedBill(null);
            }}
          >
            Close
          </Button>,
        ]}
      >
        {selectedBill && (
          <div>
            <p>
              <strong>Bill Number:</strong> {selectedBill.billNumber}
            </p>
            <p>
              <strong>Debtor:</strong> {selectedBill.debtor}
            </p>
            <p>
              <strong>Amount:</strong> ${selectedBill.amount.toLocaleString()}
            </p>
            <p>
              <strong>On Chain:</strong> {selectedBill.isOnChain ? "Yes" : "No"}
            </p>
            <p>
              <strong>Cleared:</strong> {selectedBill.isCleared ? "Yes" : "No"}
            </p>
            <p>
              <strong>Token Batch:</strong> {selectedBill.tokenBatchCode || "-"}
            </p>
            <p>
              <strong>Created At:</strong> {selectedBill.createdAt}
            </p>
          </div>
        )}
      </Modal>

      {/* Tokenize Modal */}
      <Modal
        title="Tokenize Bills"
        open={showTokenizeModal}
        onCancel={() => setShowTokenizeModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowTokenizeModal(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary">
            Tokenize
          </Button>,
        ]}
      >
        <p>Selected {selectedBills.length} bills for tokenization</p>
        <p>Form for tokenization parameters would go here</p>
      </Modal>
    </div>
  );
}
