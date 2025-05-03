"use client";

import {
  Table,
  Card,
  Space,
  Button,
  Tooltip,
  Input,
  Select,
  message,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import {
  ShoppingCartOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { TokenInfo } from "./types";
import TokenPurchaseModal from "./components/TokenPurchaseModal";
import TokenDetailModal from "./components/TokenDetailModal";

const { Title } = Typography;
const { Option } = Select;

export default function TokenMarketPage() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterStablecoin, setFilterStablecoin] = useState<string | undefined>();
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Mock data loader
  const loadTokens = async () => {
    setIsLoading(true);
    try {
      // Mock response
      const mockData: TokenInfo[] = Array.from({ length: 5 }, (_, i) => ({
        token_batch: `Batch-${i + 1}`,
        creditor: `0xCreditorAddress${i}`,
        debtor: `0xDebtorAddress${i}`,
        stablecoin: ["USDT", "USDC", "DAI"][i % 3],
        ticket_quantity: 100 + i,
        total_issued_amount: BigInt(10000 + i * 100),
        debtor_signed: Math.random() > 0.5,
        created_at: new Date().toISOString(),
        wallet_created: `0xWallet${i}`,
        updated_at: new Date().toISOString(),
        available: 50 + i * 10,
        // 新增字段
        sold_amount: 30 + i * 5,
        repaid_amount: 20 + i * 4,
        valid_amount: 80 + i * 3,
      }));

      setTokens(mockData);
    } catch (err) {
      message.error("Failed to load token list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const filteredTokens = tokens.filter((token) => {
    const matchesSearch =
      token.token_batch.toLowerCase().includes(searchText.toLowerCase()) ||
      token.creditor.toLowerCase().includes(searchText.toLowerCase()) ||
      token.debtor.toLowerCase().includes(searchText.toLowerCase());

    const matchesCoin =
      !filterStablecoin || token.stablecoin === filterStablecoin;

    return matchesSearch && matchesCoin;
  });

  const handlePurchase = (token: TokenInfo) => {
    setSelectedToken(token);
    setShowPurchaseModal(true);
  };

  const handleDetail = (token: TokenInfo) => {
    setSelectedToken(token);
    setShowDetailModal(true);
  };

  const columns = [
    {
      title: "Token Batch",
      dataIndex: "token_batch",
      render: (text: string, record: TokenInfo) => (
        <a onClick={() => handleDetail(record)}>{text}</a>
      ),
    },
    {
      title: "Creditor",
      dataIndex: "creditor",
    },
    {
      title: "Debtor",
      dataIndex: "debtor",
    },
    {
      title: "Stablecoin",
      dataIndex: "stablecoin",
    },
    {
      title: "Issued Tickets",
      dataIndex: "ticket_quantity",
    },
    {
      title: "Total Issued Amount",
      dataIndex: "total_issued_amount",
      render: (val: bigint) => `$${val.toString()}`,
    },
    {
      title: "Valid Amount",
      dataIndex: "valid_amount",
      render: (val: number) => `$${val}`,
    },
  
    {
      title: "Sold Amount",
      dataIndex: "sold_amount",
      render: (val: number) => `$${val}`,
    },
    {
      title: "Available",
      dataIndex: "available",
      render: (val: number) => `$${val}`,
    },
    {
      title: "Repaid Amount",
      dataIndex: "repaid_amount",
      render: (val: number) => `$${val}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: TokenInfo) => (
        <Space>
          <Tooltip title="Purchase">
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={() => handlePurchase(record)}
              disabled={!record.debtor_signed || record.available === 0}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} onClick={() => handleDetail(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Title level={2}>Token Market</Title>
      </div>

      {/* <Card className="mb-6">
        <Space direction="horizontal" size="large">
          <Input
            placeholder="Search by batch, creditor or debtor"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by stablecoin"
            style={{ width: 200 }}
            onChange={(val) => setFilterStablecoin(val)}
            allowClear
          >
            <Option value="USDT">USDT</Option>
            <Option value="USDC">USDC</Option>
            <Option value="DAI">DAI</Option>
          </Select>
        </Space>
      </Card> */}
      <Card className="mb-6">
      <Table
        loading={isLoading}
        dataSource={filteredTokens}
        columns={columns}
        rowKey="token_batch"
        pagination={{ pageSize: 8 }}
      />
      </Card>

      <TokenPurchaseModal
        open={showPurchaseModal}
        token={selectedToken}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={loadTokens}
      />

      <TokenDetailModal
        open={showDetailModal}
        token={selectedToken}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
}
