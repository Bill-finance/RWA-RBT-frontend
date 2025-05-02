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
  Spin,
} from "antd";
import { SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { tokenApi, TokenMarketData } from "../utils/apis/token";

const { Title, Text } = Typography;
const { Option } = Select;

interface ApiError {
  message: string;
  code?: number;
}

export default function TokenMarketPage() {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<TokenMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenMarketData | null>(
    null
  );
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState<number | null>(null);
  const [filterStablecoin, setFilterStablecoin] = useState<string>("");
  const [isPurchasing, setIsPurchasing] = useState(false);

  const [form] = Form.useForm();

  // Load tokens when component mounts
  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const response = await tokenApi.list();
      if (response?.code === 200 && Array.isArray(response.data)) {
        setTokens(response.data);
      } else {
        message.error("Failed to load market tokens");
        setTokens([]);
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      message.error(apiError.message || "Failed to load market tokens");
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handlePurchase = (token: TokenMarketData) => {
    if (!isConnected) {
      message.warning("Please connect your wallet to purchase tokens");
      return;
    }

    setSelectedToken(token);
    setPurchaseAmount(null);
    form.resetFields();
    setShowPurchaseModal(true);
  };

  const handleViewDetails = async (token: TokenMarketData) => {
    try {
      setIsLoading(true);
      const response = await tokenApi.getByBatch(token.token_batch);
      if (response?.code === 200) {
        setSelectedToken(response.data);
        setShowDetailsModal(true);
      } else {
        message.error("Failed to load token details");
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      message.error(apiError.message || "Failed to load token details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedToken || !purchaseAmount || !address) {
      message.warning(
        "Please enter a valid amount and ensure wallet is connected"
      );
      return;
    }

    if (purchaseAmount > (selectedToken.available_amount || 0)) {
      message.error("Purchase amount exceeds available amount");
      return;
    }

    try {
      setIsPurchasing(true);
      const response = await tokenApi.purchase({
        token_batch: selectedToken.token_batch,
        amount: purchaseAmount,
        buyer_address: address,
      });

      if (response?.code === 200) {
        message.success(
          `Successfully purchased ${purchaseAmount} ${selectedToken.stablecoin} of token ${selectedToken.token_batch}`
        );
        await loadTokens(); // Refresh the token list
        setShowPurchaseModal(false);
      } else {
        message.error(response?.msg || "Failed to purchase tokens");
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      message.error(apiError.message || "Failed to purchase tokens");
    } finally {
      setIsPurchasing(false);
    }
  };

  const columns = [
    {
      title: "Token Batch",
      dataIndex: "token_batch",
      key: "token_batch",
      render: (text: string, record: TokenMarketData) => (
        <a onClick={() => handleViewDetails(record)}>{text}</a>
      ),
    },
    {
      title: "Creditor",
      dataIndex: "creditor_name",
      key: "creditor_name",
    },
    {
      title: "Debtor",
      dataIndex: "debtor_name",
      key: "debtor_name",
    },
    {
      title: "Stablecoin",
      dataIndex: "stablecoin",
      key: "stablecoin",
    },
    {
      title: "Available Amount",
      dataIndex: "available_amount",
      key: "available_amount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Interest Rate",
      dataIndex: "interest_rate",
      key: "interest_rate",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "Maturity Date",
      dataIndex: "maturity_date",
      key: "maturity_date",
    },
    {
      title: "Risk Rating",
      dataIndex: "risk_rating",
      key: "risk_rating",
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
      render: (_: unknown, record: TokenMarketData) => (
        <Space>
          <Tooltip title="Purchase Tokens">
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              disabled={
                record.status !== "active" || record.available_amount <= 0
              }
              onClick={() => handlePurchase(record)}
            >
              Purchase
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredTokens = tokens.filter((token) => {
    const matchesSearch =
      token.token_batch.toLowerCase().includes(searchText.toLowerCase()) ||
      token.creditor_name.toLowerCase().includes(searchText.toLowerCase()) ||
      token.debtor_name.toLowerCase().includes(searchText.toLowerCase());

    const matchesStablecoin =
      !filterStablecoin || token.stablecoin === filterStablecoin;

    return matchesSearch && matchesStablecoin;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Title level={2}>Token Market</Title>
        <Text type="secondary">Browse and purchase tokenized receivables</Text>
      </div>

      <Card className="mb-8">
        <Space className="w-full" size="large">
          <Input
            placeholder="Search by token batch, creditor, or debtor"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 400 }}
          />
          <Select
            placeholder="Filter by stablecoin"
            style={{ width: 200 }}
            onChange={setFilterStablecoin}
            allowClear
          >
            <Option value="USDT">USDT</Option>
            <Option value="USDC">USDC</Option>
            <Option value="DAI">DAI</Option>
          </Select>
        </Space>
      </Card>

      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={filteredTokens}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>

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
            loading={isPurchasing}
            onClick={handleConfirmPurchase}
          >
            Purchase
          </Button>,
        ]}
      >
        {selectedToken && (
          <Form form={form} layout="vertical">
            <Form.Item label="Token Batch">
              <Text>{selectedToken.token_batch}</Text>
            </Form.Item>
            <Form.Item label="Available Amount">
              <Text>
                {selectedToken.available_amount.toLocaleString()}{" "}
                {selectedToken.stablecoin}
              </Text>
            </Form.Item>
            <Form.Item
              label="Purchase Amount"
              name="amount"
              rules={[
                {
                  required: true,
                  message: "Please enter purchase amount",
                },
                {
                  validator: (_, value) => {
                    if (value > selectedToken.available_amount) {
                      return Promise.reject("Amount exceeds available tokens");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                max={selectedToken.available_amount}
                onChange={(value) => setPurchaseAmount(value)}
                addonAfter={selectedToken.stablecoin}
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
        width={800}
      >
        {selectedToken && (
          <div>
            <Card>
              <Space direction="vertical" size="large" className="w-full">
                <div>
                  <Text type="secondary">Token Batch</Text>
                  <br />
                  <Text strong>{selectedToken.token_batch}</Text>
                </div>
                <Divider />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Text type="secondary">Creditor</Text>
                    <br />
                    <Text strong>{selectedToken.creditor_name}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {selectedToken.creditor_address}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">Debtor</Text>
                    <br />
                    <Text strong>{selectedToken.debtor_name}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {selectedToken.debtor_address}
                    </Text>
                  </div>
                </div>
                <Divider />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Text type="secondary">Total Amount</Text>
                    <br />
                    <Text strong>
                      {selectedToken.total_amount.toLocaleString()}{" "}
                      {selectedToken.stablecoin}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">Available Amount</Text>
                    <br />
                    <Text strong>
                      {selectedToken.available_amount.toLocaleString()}{" "}
                      {selectedToken.stablecoin}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">Sold Amount</Text>
                    <br />
                    <Text strong>
                      {selectedToken.sold_amount.toLocaleString()}{" "}
                      {selectedToken.stablecoin}
                    </Text>
                  </div>
                </div>
                <Divider />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Text type="secondary">Interest Rate</Text>
                    <br />
                    <Text strong>{selectedToken.interest_rate}%</Text>
                  </div>
                  <div>
                    <Text type="secondary">Maturity Date</Text>
                    <br />
                    <Text strong>{selectedToken.maturity_date}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Risk Rating</Text>
                    <br />
                    <Rate disabled defaultValue={selectedToken.risk_rating} />
                  </div>
                </div>
              </Space>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
