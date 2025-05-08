"use client";

import { Table, Card, Space, Button, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { tokenApi, TokenMarketData } from "../utils/apis/token";
import TokenPurchaseModal from "./components/TokenPurchaseModal";
import { message } from "../components/Message";

const { Title } = Typography;

interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

export default function TokenMarketPage() {
  const [tokens, setTokens] = useState<TokenMarketData[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterStablecoin, setFilterStablecoin] = useState<
    string | undefined
  >();
  const [selectedToken, setSelectedToken] = useState<TokenMarketData | null>(
    null
  );
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  // const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const response = (await tokenApi.getTokenMarketList({
        page: 1,
        pageSize: 10,
        tokenType: filterStablecoin,
      })) as ApiResponse<TokenMarketData[]>;

      if (response.code === 0) {
        setTokens(response.data);
      } else {
        message.error(response.msg || "Failed to load token list");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load token list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, [filterStablecoin]);

  const filteredTokens = tokens.filter((token) => {
    const matchesSearch =
      token.batch_reference.toLowerCase().includes(searchText.toLowerCase()) ||
      token.creditor_address.toLowerCase().includes(searchText.toLowerCase()) ||
      token.debtor_address.toLowerCase().includes(searchText.toLowerCase());

    const matchesCoin =
      !filterStablecoin || token.stablecoin_symbol === filterStablecoin;

    return matchesSearch && matchesCoin;
  });

  const handlePurchase = (token: TokenMarketData) => {
    setSelectedToken(token);
    setShowPurchaseModal(true);
  };

  const columns = [
    {
      title: "Batch Reference",
      dataIndex: "batch_reference",
    },
    {
      title: "Creditor",
      dataIndex: "creditor_address",
    },
    {
      title: "Debtor",
      dataIndex: "debtor_address",
    },
    {
      title: "Stablecoin",
      dataIndex: "stablecoin_symbol",
    },
    {
      title: "Total Amount",
      dataIndex: "total_token_amount",
    },
    {
      title: "Available Amount",
      dataIndex: "available_token_amount",
    },
    {
      title: "Sold Amount",
      dataIndex: "sold_token_amount",
    },
    {
      title: "Token Value",
      dataIndex: "token_value_per_unit",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: TokenMarketData) => (
        <Space>
          <Tooltip title="Purchase">
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={() => handlePurchase(record)}
              disabled={Number(record.available_token_amount) === 0}
            />
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

      <Card className="mb-6">
        <Table
          loading={isLoading}
          dataSource={filteredTokens}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <TokenPurchaseModal
        open={showPurchaseModal}
        token={selectedToken}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={loadTokens}
      />

      {/* <TokenDetailModal
        open={showDetailModal}
        token={selectedToken}
        onClose={() => setShowDetailModal(false)}
      /> */}
    </div>
  );
}
