"use client";

import { Table, Card, Space, Button, Tooltip, Typography, Badge } from "antd";
import { useCallback, useEffect, useState } from "react";
import { ShoppingCartOutlined, SyncOutlined } from "@ant-design/icons";
import { tokenApi, TokenMarketData } from "../utils/apis/token";
import TokenPurchaseModal from "./components/TokenPurchaseModal";
import { message } from "../components/Message";
import HashText from "../components/ui/HashText";
import { useContract } from "@/app/utils/contracts/useContract";
import { invoiceBatchApi } from "@/app/utils/apis/invoiceBatch";

const { Title } = Typography;

export default function TokenMarketPage() {
  const [tokens, setTokens] = useState<TokenMarketData[]>([]);
  const [searchText] = useState("");
  const [filterStablecoin] = useState<string | undefined>();
  const [selectedToken, setSelectedToken] = useState<TokenMarketData | null>(
    null
  );
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshingBatchId, setRefreshingBatchId] = useState<string | null>(
    null
  );

  // Get contract info for batch verification
  const { contractAddress } = useContract();

  // Read contract to verify batch issuance status
  const verifyBatchStatus = async (batchId: string): Promise<boolean> => {
    try {
      setRefreshingBatchId(batchId);

      // Add console log to verify data
      console.log("Verifying batch status:", {
        batchId,
        contractAddress,
      });

      // Call the existing API to check batch status
      const [batchDetailResponse] = await invoiceBatchApi.detail(batchId);

      if (
        batchDetailResponse.code === 200 &&
        batchDetailResponse.data.length > 0
      ) {
        // 检查第一个返回对象的状态
        const batch = batchDetailResponse.data[0];
        // 假设 "ISSUED" 状态表示已经上链发行
        const isIssued = batch.status === "ISSUED";

        console.log("Batch status:", batch.status, "isIssued:", isIssued);

        // Update token status in the UI with verification result
        setTokens((prev) =>
          prev.map((token) =>
            token.batch_reference === batchId
              ? { ...token, verified: true, is_issued: isIssued }
              : token
          )
        );

        if (!isIssued) {
          message.warning(`批次状态: ${batch.status}，尚未发行，无法购买`);
        }

        return isIssued;
      }

      message.error("未找到批次信息");
      return false;
    } catch (error) {
      console.error("Failed to verify batch status:", error);
      message.error("验证批次状态失败");
      return false;
    } finally {
      setRefreshingBatchId(null);
    }
  };

  const loadTokens = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await tokenApi.getTokenMarketList({
        page: 1,
        pageSize: 10,
        tokenType: filterStablecoin,
      });

      if (response.code === 200) {
        // Initialize tokens with verification status as needed
        const tokensWithStatus = response.data.map((token) => ({
          ...token,
          verified: false,
          is_issued: undefined,
        }));
        setTokens(tokensWithStatus);
      } else {
        message.error(response.msg || "Failed to load token list");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load token list");
    } finally {
      setIsLoading(false);
    }
  }, [filterStablecoin]);

  useEffect(() => {
    loadTokens();
  }, [filterStablecoin, loadTokens]);

  const filteredTokens = tokens.filter((token) => {
    const matchesSearch =
      token.batch_reference.toLowerCase().includes(searchText.toLowerCase()) ||
      token.creditor_address.toLowerCase().includes(searchText.toLowerCase()) ||
      token.debtor_address.toLowerCase().includes(searchText.toLowerCase());

    const matchesCoin =
      !filterStablecoin || token.stablecoin_symbol === filterStablecoin;

    return matchesSearch && matchesCoin;
  });

  const handlePurchase = async (token: TokenMarketData) => {
    try {
      // Verify batch status before proceeding with purchase
      const isIssued = await verifyBatchStatus(token.batch_reference);

      if (!isIssued) {
        message.error(
          "This token batch has not been issued yet and cannot be purchased"
        );
        return;
      }

      setSelectedToken(token);
      setShowPurchaseModal(true);
    } catch (error) {
      console.error("Error before purchase:", error);
      message.error("Failed to verify token status");
    }
  };

  const columns = [
    {
      title: "Batch Reference",
      dataIndex: "batch_reference",
      render: (text: string, record: TokenMarketData) => {
        return (
          <div className="flex items-center">
            <HashText text={text} />
            {record.verified && record.is_issued && (
              <Badge status="success" text="Verified" className="ml-2" />
            )}
            {record.verified && record.is_issued === false && (
              <Badge status="error" text="Not Issued" className="ml-2" />
            )}
          </div>
        );
      },
    },
    {
      title: "Payee",
      dataIndex: "payee",
      render: (text: string) => {
        return <HashText text={text} />;
      },
    },
    {
      title: "Payer",
      dataIndex: "payer",
      render: (text: string) => {
        return <HashText text={text} />;
      },
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
          <Tooltip title="Verify Status">
            <Button
              icon={<SyncOutlined />}
              onClick={() => verifyBatchStatus(record.batch_reference)}
              loading={refreshingBatchId === record.batch_reference}
            />
          </Tooltip>
          <Tooltip
            title={
              Number(record.available_token_amount) === 0
                ? "Sold Out"
                : "Purchase"
            }
          >
            <Button
              icon={<ShoppingCartOutlined />}
              onClick={() => handlePurchase(record)}
              disabled={
                Number(record.available_token_amount) === 0 ||
                (record.verified && record.is_issued === false)
              }
              loading={refreshingBatchId === record.batch_reference}
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
    </div>
  );
}
