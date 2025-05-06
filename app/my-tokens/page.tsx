"use client";

import {
  Table,
  Card,
  Space,
  Button,
  Tooltip,
  Input,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  ShoppingCartOutlined,
  FileSearchOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { tokenApi, UserHoldingTokenData } from "../utils/apis/token";
import TokenRepurchaseModal from "./components/TokenRepurchaseModal";
import TokenHistoryModal from "./components/TokenHistoryModal";

import type { ColumnsType } from "antd/es/table";

const { Title } = Typography;

interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

export default function MyTokenPage() {
  const [tokens, setTokens] = useState<UserHoldingTokenData[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedToken, setSelectedToken] =
    useState<UserHoldingTokenData | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedTokenBatch, setSelectedTokenBatch] = useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const response = (await tokenApi.getHolding()) as ApiResponse<
        UserHoldingTokenData[]
      >;
      if (response.code === 0) {
        setTokens(response.data);
      } else {
        message.error(response.msg || "Failed to load holdings");
      }
    } catch (err) {
      message.error("Failed to load holdings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const handlePurchase = (record: UserHoldingTokenData) => {
    setSelectedToken(record);
    setShowPurchaseModal(true);
  };

  const handleHistory = (record: UserHoldingTokenData) => {
    setSelectedTokenBatch(record.batch_reference);
    setShowHistoryModal(true);
  };

  const columns: ColumnsType<UserHoldingTokenData> = [
    {
      title: "Batch Reference",
      dataIndex: "batch_reference",
    },
    {
      title: "Token Amount",
      dataIndex: "token_amount",
    },
    {
      title: "Purchase Value",
      dataIndex: "purchase_value",
    },
    {
      title: "Current Value",
      dataIndex: "current_value",
    },
    {
      title: "Purchase Date",
      dataIndex: "purchase_date",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 160,
      render: (_: any, record: UserHoldingTokenData) => (
        <Space>
          <Tooltip title="Purchase">
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={() => handlePurchase(record)}
            />
          </Tooltip>
          <Tooltip title="History">
            <Button
              icon={<FileSearchOutlined />}
              onClick={() => handleHistory(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <Title level={3}>My Tokens</Title>
      <Input
        placeholder="Search..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16, width: 300 }}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <Card className="mb-6">
        <Table
          loading={isLoading}
          dataSource={tokens.filter((t) =>
            JSON.stringify(t).toLowerCase().includes(searchText.toLowerCase())
          )}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <TokenRepurchaseModal
        open={showPurchaseModal}
        token={selectedToken}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={loadTokens}
      />

      <TokenHistoryModal
        open={showHistoryModal}
        tokenBatch={selectedTokenBatch}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
}
