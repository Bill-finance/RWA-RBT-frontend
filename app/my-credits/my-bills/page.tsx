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
  message,
  Card,
} from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { transactionApi, TransactionRecord } from "@/app/utils/apis";

const { Title } = Typography;

export default function MyBillsPage() {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionRecord | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
    []
  );

  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await transactionApi.list();
        if (response.code === 0) {
          setTransactions(response.data);
        } else {
          message.error(response.msg || "Failed to load transactions");
        }
      } catch (error) {
        message.error("Failed to load transactions");
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      loadTransactions();
    }
  }, [isConnected]);

  const columns = [
    {
      title: "Select",
      key: "select",
      render: (_: any, record: TransactionRecord) => (
        <input
          type="checkbox"
          checked={selectedTransactions.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTransactions([...selectedTransactions, record.id]);
            } else {
              setSelectedTransactions(
                selectedTransactions.filter((id) => id !== record.id)
              );
            }
          }}
        />
      ),
    },
    {
      title: "Transaction ID",
      dataIndex: "id",
      key: "id",
      render: (text: string, record: TransactionRecord) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text: string) => `$${Number(text).toLocaleString()}`,
    },
    {
      title: "Type",
      dataIndex: "transaction_type",
      key: "transaction_type",
      render: (text: string) => (
        <Tag color={text === "CREDIT" ? "green" : "blue"}>{text}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => (
        <Tag color={text === "COMPLETED" ? "green" : "orange"}>{text}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "transaction_date",
      key: "transaction_date",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: TransactionRecord) => (
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleViewDetail = (transaction: TransactionRecord) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.id.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.transaction_type
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-zinc-900 border-zinc-800 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} style={{ color: "white", margin: 0 }}>
            My Bills
          </Title>
          <Space>
            <Input
              placeholder="Search transactions..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: 250 }}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Transaction Detail Modal */}
      <Modal
        title="Transaction Details"
        open={showDetailModal}
        onCancel={() => {
          setShowDetailModal(false);
          setSelectedTransaction(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setShowDetailModal(false);
              setSelectedTransaction(null);
            }}
          >
            Close
          </Button>,
        ]}
      >
        {selectedTransaction && (
          <div>
            <p>
              <strong>Transaction ID:</strong> {selectedTransaction.id}
            </p>
            <p>
              <strong>Amount:</strong> $
              {Number(selectedTransaction.amount).toLocaleString()}
            </p>
            <p>
              <strong>Type:</strong> {selectedTransaction.transaction_type}
            </p>
            <p>
              <strong>Status:</strong> {selectedTransaction.status}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedTransaction.transaction_date).toLocaleString()}
            </p>
            <p>
              <strong>Holding ID:</strong> {selectedTransaction.holding_id}
            </p>
            <p>
              <strong>Invoice ID:</strong> {selectedTransaction.invoice_id}
            </p>
            <p>
              <strong>User ID:</strong> {selectedTransaction.user_id}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
