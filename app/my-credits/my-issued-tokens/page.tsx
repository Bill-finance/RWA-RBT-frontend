"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Button,
  Table,
  Typography,
  Space,
  Tag,
  message,
  Card,
  Statistic,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  PieChartOutlined,
  EyeOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

// Mock data for tokens
interface Token {
  id: string;
  tokenBatchNumber: string;
  debtorAddress: string;
  debtorName: string;
  stablecoin: string;
  issuedAmount: number;
  soldAmount: number;
  availableAmount: number;
  repaidAmount: number;
  interestAmount: number;
  issuedDate: string;
  expiryDate: string;
  status: "active" | "expired" | "completed";
}

const generateMockTokens = (): Token[] => {
  const stablecoins = ["USDT", "USDC", "DAI"];
  const statuses: ("active" | "expired" | "completed")[] = [
    "active",
    "expired",
    "completed",
  ];

  return Array.from({ length: 8 }, (_, index) => {
    const issuedAmount = Math.floor(Math.random() * 1000000) + 100000;
    const soldAmount = Math.floor(Math.random() * issuedAmount);
    const repaidAmount = Math.floor(Math.random() * soldAmount);
    const interestAmount = Math.floor(issuedAmount * Math.random() * 0.1);

    return {
      id: `t-${index + 1}`,
      tokenBatchNumber: `BATCH-${(index + 1).toString().padStart(4, "0")}`,
      debtorAddress: `0x${Math.random().toString(16).slice(2, 40)}`,
      debtorName: `Company ${index + 1}`,
      stablecoin: stablecoins[Math.floor(Math.random() * stablecoins.length)],
      issuedAmount,
      soldAmount,
      availableAmount: issuedAmount - soldAmount,
      repaidAmount,
      interestAmount,
      issuedDate: new Date(
        Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      expiryDate: new Date(
        Date.now() + Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    };
  });
};

export default function MyIssuedTokensPage() {
  const { isConnected } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // Load tokens when component mounts
  useEffect(() => {
    const loadTokens = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with an actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTokens(generateMockTokens());
      } catch (error) {
        console.error(error);
        message.error("Failed to load tokens");
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      loadTokens();
    }
  }, [isConnected]);

  // Calculate summary statistics
  const totalIssued = tokens.reduce(
    (sum, token) => sum + token.issuedAmount,
    0
  );
  const totalSold = tokens.reduce((sum, token) => sum + token.soldAmount, 0);
  const totalAvailable = tokens.reduce(
    (sum, token) => sum + token.availableAmount,
    0
  );
  const totalRepaid = tokens.reduce(
    (sum, token) => sum + token.repaidAmount,
    0
  );
  const totalInterest = tokens.reduce(
    (sum, token) => sum + token.interestAmount,
    0
  );

  const columns = [
    {
      title: "Token Batch",
      dataIndex: "tokenBatchNumber",
      key: "tokenBatchNumber",
      render: (text: string, record: Token) => (
        <a onClick={() => setSelectedToken(record)}>{text}</a>
      ),
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
      title: "Issued Amount",
      dataIndex: "issuedAmount",
      key: "issuedAmount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Sold Amount",
      dataIndex: "soldAmount",
      key: "soldAmount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Available Amount",
      dataIndex: "availableAmount",
      key: "availableAmount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Repaid Amount",
      dataIndex: "repaidAmount",
      key: "repaidAmount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Interest Amount",
      dataIndex: "interestAmount",
      key: "interestAmount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Issued Date",
      dataIndex: "issuedDate",
      key: "issuedDate",
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: "active" | "expired" | "completed") => {
        const color =
          status === "active" ? "green" : status === "expired" ? "red" : "blue";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Token) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setSelectedToken(record)}
            />
          </Tooltip>
          <Tooltip title="Sales Analytics">
            <Button
              type="text"
              icon={<PieChartOutlined />}
              onClick={() => message.info("Sales analytics would open here")}
            />
          </Tooltip>
          <Tooltip title="Interest History">
            <Button
              type="text"
              icon={<LineChartOutlined />}
              onClick={() => message.info("Interest history would open here")}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} style={{ color: "white", marginBottom: 24 }}>
        My Issued Tokens
      </Title>

      {/* Summary Cards */}
      <Row gutter={16} className="mb-8">
        <Col span={4}>
          <Card className="bg-zinc-900 border-zinc-800">
            <Statistic
              title="Total Issued"
              value={totalIssued}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix="$"
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-zinc-900 border-zinc-800">
            <Statistic
              title="Total Sold"
              value={totalSold}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              prefix="$"
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-zinc-900 border-zinc-800">
            <Statistic
              title="Available"
              value={totalAvailable}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              prefix="$"
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-zinc-900 border-zinc-800">
            <Statistic
              title="Repaid"
              value={totalRepaid}
              precision={0}
              valueStyle={{ color: "#722ed1" }}
              prefix="$"
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-zinc-900 border-zinc-800">
            <Statistic
              title="Interest Earned"
              value={totalInterest}
              precision={0}
              valueStyle={{ color: "#fa8c16" }}
              prefix="$"
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card className="bg-zinc-900 border-zinc-800">
            <Statistic
              title="Sale Percentage"
              value={totalIssued ? (totalSold / totalIssued) * 100 : 0}
              precision={2}
              valueStyle={{ color: "#13c2c2" }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* Tokens Table */}
      <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
        <Table
          columns={columns}
          dataSource={tokens}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1500 }}
        />
      </Card>
    </div>
  );
}
