"use client";

import {
  Table,
  Card,
  Space,
  Button,
  Tooltip,
  Input,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import {
  ShoppingCartOutlined,
  EyeOutlined,
  FileSearchOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { TokenInfo } from "../token-market/types";
import TokenPurchaseModal from "../token-market//components/TokenPurchaseModal";
import TokenDetailModal from "../token-market/components/TokenDetailModal";
import TokenHistoryModal from "./components/TokenHistoryModal";


import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

export default function MyTokenPage() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedTokenBatch, setSelectedTokenBatch] = useState<string | undefined>();

  useEffect(() => {
    const mockData: any[] = [
      {
        wallet_address: "0xabc123...",
        token_batch: "Batch-001",
        stablecoin: "USDT",
        total_holding: 9516,
        purchased_amount: 8663,
        interest_amount: 853,
        valid_amount: 9488,
        repayment_shared: 28,
        book_amount: 9519,
        interest_transferred: 452,
        interest_untransferred: 401,
        repayment_settled: 6,
        repayment_unsettled: 22,
        event_type: "interest",
        created_at: "2025/5/3",
        wallet_created: "Wallet-001",
        updated_at: "2025/5/3",
      },
    ];
    setTokens(mockData);
  }, []);

  const handlePurchase = (record: TokenInfo) => {
    setSelectedToken(record);
    setShowPurchaseModal(true);
  };

  const handleDetail = (record: TokenInfo) => {
    setSelectedToken(record);
    setShowDetailModal(true);
  };

  const handleHistory = (record: TokenInfo) => {
    setSelectedTokenBatch(record.token_batch);
    setShowHistoryModal(true);
  };

  const columns : ColumnsType<TokenInfo> = [
    {
      title: "Wallet Address",
      dataIndex: "wallet_address",
    },
    {
        title: "Token Batch",
        dataIndex: "token_batch",
        render: (text: string, record: TokenInfo) => (
          <a onClick={() => handleDetail(record)}>{text}</a>
        ),
      },
    {
      title: "Stablecoin",
      dataIndex: "stablecoin",
    },
    {
      title: "Total Holding",
      dataIndex: "total_holding",
    },
    {
      title: "Purchased Amount",
      dataIndex: "purchased_amount",
    },
    {
      title: "Interest Amount",
      dataIndex: "interest_amount",
    },
    {
      title: "Valid Amount",
      dataIndex: "valid_amount",
    },
    {
      title: "Repayment Shared",
      dataIndex: "repayment_shared",
    },
    {
      title: "Book Amount",
      dataIndex: "book_amount",
    },
    {
      title: "Interest Transferred",
      dataIndex: "interest_transferred",
    },
    {
      title: "Interest Untransferred",
      dataIndex: "interest_untransferred",
    },
    {
      title: "Repayment Settled",
      dataIndex: "repayment_settled",
    },
    {
      title: "Repayment Unsettled",
      dataIndex: "repayment_unsettled",
    },
    {
      title: "Event Type",
      dataIndex: "event_type",
    },
    {
      title: "Created Time",
      dataIndex: "created_at",
    },
    {
      title: "Created Wallet",
      dataIndex: "wallet_created",
    },
    {
      title: "Updated Time",
      dataIndex: "updated_at",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 160,
      render: (_: any, record: TokenInfo) => (
        <Space>
          <Tooltip title="Purchase">
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={() => handlePurchase(record)}
            />
          </Tooltip>
          <Tooltip title="Details">
            <Button icon={<EyeOutlined />} onClick={() => handleDetail(record)} />
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
      {/* <Input
        placeholder="Search..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16, width: 300 }}
        onChange={(e) => setSearchText(e.target.value)}
      /> */}
   <Card className="mb-6">
      <Table
        dataSource={tokens.filter((t) =>
          JSON.stringify(t).toLowerCase().includes(searchText.toLowerCase())
        )}
        columns={columns}
        rowKey="token_batch"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }} 
      />
      </Card>

      <TokenPurchaseModal
        open={showPurchaseModal}
        token={selectedToken}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={() => setShowPurchaseModal(false)}
      />

      <TokenDetailModal
        open={showDetailModal}
        token={selectedToken}
        onClose={() => setShowDetailModal(false)}
      />
      <TokenHistoryModal
        open={showHistoryModal}
        tokenBatch={selectedTokenBatch}
        onClose={() => setShowHistoryModal(false)}
    />
    </div>
  );
}
