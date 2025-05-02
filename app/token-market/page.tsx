"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Button,
  Table,
  Input,
  Typography,
  Space,
  Tag,
  message,
  Card,
  Modal,
  Form,
  InputNumber,
  Select,
  Tooltip,
  Divider,
  Rate,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  UserOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

// Mock data for marketplace tokens
interface MarketToken {
  id: string;
  tokenBatchNumber: string;
  creditorName: string;
  creditorAddress: string;
  debtorName: string;
  debtorAddress: string;
  stablecoin: string;
  totalAmount: number;
  availableAmount: number;
  soldAmount: number;
  interestRate: number;
  maturityDate: string;
  risk: number; // 1-5 risk rating
  status: "active" | "fully_sold" | "expired";
}

const generateMockMarketTokens = (): MarketToken[] => {
  const stablecoins = ["USDT", "USDC", "DAI"];
  const statuses: ("active" | "fully_sold" | "expired")[] = [
    "active",
    "fully_sold",
    "expired",
  ];

  return Array.from({ length: 10 }, (_, index) => {
    const totalAmount = Math.floor(Math.random() * 1000000) + 100000;
    const soldAmount = Math.floor(Math.random() * totalAmount);
    const availableAmount = totalAmount - soldAmount;

    return {
      id: `m-${index + 1}`,
      tokenBatchNumber: `BATCH-${(index + 1).toString().padStart(4, "0")}`,
      creditorName: `Creditor ${index + 1}`,
      creditorAddress: `0x${Math.random().toString(16).slice(2, 40)}`,
      debtorName: `Debtor ${index + 1}`,
      debtorAddress: `0x${Math.random().toString(16).slice(2, 40)}`,
      stablecoin: stablecoins[Math.floor(Math.random() * stablecoins.length)],
      totalAmount,
      availableAmount,
      soldAmount,
      interestRate: Math.floor(Math.random() * 15) + 5, // 5-20% interest rate
      maturityDate: new Date(
        Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      risk: Math.floor(Math.random() * 5) + 1, // 1-5 risk rating
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
};

export default function TokenMarketPage() {
  const { isConnected } = useAccount();
  const [tokens, setTokens] = useState<MarketToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedToken, setSelectedToken] = useState<MarketToken | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState<number | null>(null);
  const [filterStablecoin, setFilterStablecoin] = useState<string>("");

  const [form] = Form.useForm();

  // Load tokens when component mounts
  useEffect(() => {
    const loadTokens = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with an actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTokens(generateMockMarketTokens());
      } catch (error) {
        console.error(error);
        message.error("Failed to load market tokens");
      } finally {
        setIsLoading(false);
      }
    };

    loadTokens();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handlePurchase = (token: MarketToken) => {
    if (!isConnected) {
      message.warning("Please connect your wallet to purchase tokens");
      return;
    }

    setSelectedToken(token);
    setPurchaseAmount(null);
    form.resetFields();
    setShowPurchaseModal(true);
  };

  const handleViewDetails = (token: MarketToken) => {
    setSelectedToken(token);
    setShowDetailsModal(true);
  };

  const handleConfirmPurchase = () => {
    if (!selectedToken || !purchaseAmount) {
      message.warning("Please enter a valid amount");
      return;
    }

    if (purchaseAmount > (selectedToken.availableAmount || 0)) {
      message.error("Purchase amount exceeds available amount");
      return;
    }

    // In a real app, this would call a contract method
    message.success(
      `Successfully purchased ${purchaseAmount} ${selectedToken.stablecoin} of token ${selectedToken.tokenBatchNumber}`
    );

    // Update local state
    setTokens(
      tokens.map((token) => {
        if (token.id === selectedToken.id) {
          return {
            ...token,
            availableAmount: token.availableAmount - purchaseAmount,
            soldAmount: token.soldAmount + purchaseAmount,
            status:
              token.availableAmount - purchaseAmount <= 0
                ? "fully_sold"
                : token.status,
          };
        }
        return token;
      })
    );

    setShowPurchaseModal(false);
  };

  const columns = [
    {
      title: "Token Batch",
      dataIndex: "tokenBatchNumber",
      key: "tokenBatchNumber",
      render: (text: string, record: MarketToken) => (
        <a onClick={() => handleViewDetails(record)}>{text}</a>
      ),
    },
    {
      title: "Creditor",
      dataIndex: "creditorName",
      key: "creditorName",
    },
    {
      title: "Debtor",
      dataIndex: "debtorName",
      key: "debtorName",
    },
    {
      title: "Stablecoin",
      dataIndex: "stablecoin",
      key: "stablecoin",
    },
    {
      title: "Available Amount",
      dataIndex: "availableAmount",
      key: "availableAmount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Interest Rate",
      dataIndex: "interestRate",
      key: "interestRate",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "Maturity Date",
      dataIndex: "maturityDate",
      key: "maturityDate",
    },
    {
      title: "Risk Rating",
      dataIndex: "risk",
      key: "risk",
      render: (risk: number) => <Rate disabled defaultValue={risk} />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "green";
        if (status === "fully_sold") color = "blue";
        if (status === "expired") color = "red";

        return (
          <Tag color={color}>{status.replace("_", " ").toUpperCase()}</Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: MarketToken) => (
        <Space>
          <Tooltip title="Purchase Tokens">
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              disabled={
                record.status !== "active" || record.availableAmount <= 0
              }
              onClick={() => handlePurchase(record)}
            >
              Buy
            </Button>
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredTokens = tokens.filter((token) => {
    const matchesSearch =
      token.tokenBatchNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      token.creditorName.toLowerCase().includes(searchText.toLowerCase()) ||
      token.debtorName.toLowerCase().includes(searchText.toLowerCase());

    const matchesStablecoin = filterStablecoin
      ? token.stablecoin === filterStablecoin
      : true;

    return matchesSearch && matchesStablecoin;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} style={{ color: "white", marginBottom: 24 }}>
        Token Market
      </Title>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800 shadow-lg mb-8">
        <Space size="large">
          <Input
            placeholder="Search tokens..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={handleSearch}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by stablecoin"
            style={{ width: 180 }}
            allowClear
            onChange={(value) => setFilterStablecoin(value)}
          >
            <Option value="USDT">USDT</Option>
            <Option value="USDC">USDC</Option>
            <Option value="DAI">DAI</Option>
          </Select>
        </Space>
      </Card>

      {/* Tokens Table */}
      <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
        <Table
          columns={columns}
          dataSource={filteredTokens}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Purchase Modal */}
      <Modal
        title="Purchase Tokens"
        open={showPurchaseModal}
        onCancel={() => setShowPurchaseModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowPurchaseModal(false)}>
            Cancel
          </Button>,
          <Button
            key="purchase"
            type="primary"
            onClick={handleConfirmPurchase}
            disabled={!purchaseAmount}
          >
            Purchase
          </Button>,
        ]}
      >
        {selectedToken && (
          <Form form={form} layout="vertical">
            <Form.Item label="Token Batch">
              <Text>{selectedToken.tokenBatchNumber}</Text>
            </Form.Item>
            <Form.Item label="Stablecoin">
              <Text>{selectedToken.stablecoin}</Text>
            </Form.Item>
            <Form.Item label="Available Amount">
              <Text>{`$${selectedToken.availableAmount.toLocaleString()}`}</Text>
            </Form.Item>
            <Form.Item label="Interest Rate">
              <Text>{`${selectedToken.interestRate}%`}</Text>
            </Form.Item>
            <Form.Item
              label="Purchase Amount"
              name="purchaseAmount"
              rules={[
                { required: true, message: "Please enter purchase amount" },
                {
                  validator: (_, value) => {
                    if (value > (selectedToken.availableAmount || 0)) {
                      return Promise.reject("Amount exceeds available tokens");
                    }
                    if (value <= 0) {
                      return Promise.reject("Amount must be greater than 0");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                max={selectedToken.availableAmount}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
                onChange={(value) => setPurchaseAmount(value)}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Details Modal */}
      <Modal
        title="Token Details"
        open={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedToken && (
          <div>
            <div className="flex justify-between">
              <div>
                <p>
                  <strong>Token Batch:</strong> {selectedToken.tokenBatchNumber}
                </p>
                <p>
                  <strong>Stablecoin:</strong> {selectedToken.stablecoin}
                </p>
                <p>
                  <strong>Total Amount:</strong> $
                  {selectedToken.totalAmount.toLocaleString()}
                </p>
                <p>
                  <strong>Available Amount:</strong> $
                  {selectedToken.availableAmount.toLocaleString()}
                </p>
                <p>
                  <strong>Sold Amount:</strong> $
                  {selectedToken.soldAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p>
                  <strong>Interest Rate:</strong> {selectedToken.interestRate}%
                </p>
                <p>
                  <strong>Maturity Date:</strong> {selectedToken.maturityDate}
                </p>
                <p>
                  <strong>Risk Rating:</strong>{" "}
                  <Rate disabled defaultValue={selectedToken.risk} />
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedToken.status.replace("_", " ").toUpperCase()}
                </p>
              </div>
            </div>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                title="Creditor Information"
                className="bg-zinc-800 border-zinc-700"
              >
                <p>
                  <UserOutlined /> {selectedToken.creditorName}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedToken.creditorAddress}
                </p>
              </Card>

              <Card
                title="Debtor Information"
                className="bg-zinc-800 border-zinc-700"
              >
                <p>
                  <UserOutlined /> {selectedToken.debtorName}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedToken.debtorAddress}
                </p>
              </Card>
            </div>

            <Divider />

            <div className="flex justify-between mt-4">
              <Button
                icon={<HistoryOutlined />}
                onClick={() =>
                  message.info("Transaction history would open here")
                }
              >
                Transaction History
              </Button>

              {selectedToken.status === "active" &&
                selectedToken.availableAmount > 0 && (
                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowPurchaseModal(true);
                    }}
                  >
                    Purchase Tokens
                  </Button>
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
