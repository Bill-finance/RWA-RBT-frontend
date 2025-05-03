"use client";

import { Modal, Table, Tag } from "antd";
import { useEffect, useState } from "react";

export interface TokenHistory {
  event_type: "Purchase" | "Interest" | "Repaid" | string;
  amount: number;
  event_time: string;
  operator_wallet: string;
  note?: string;
}

interface Props {
  open: boolean;
  tokenBatch?: string;
  onClose: () => void;
}

const TokenHistoryModal = ({ open, tokenBatch, onClose }: Props) => {
  const [history, setHistory] = useState<TokenHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && tokenBatch) {
      loadMockHistory(tokenBatch);
    }
  }, [open, tokenBatch]);

  const loadMockHistory = async (batch: string) => {
    setLoading(true);
    try {
      // 模拟接口调用
      await new Promise((res) => setTimeout(res, 500));
      const mock: TokenHistory[] = [
        {
          event_type: "Purchase",
          amount: 1000,
          event_time: "2025-05-01 14:22:10",
          operator_wallet: "0x1234567890abcdef...",
        },
        {
          event_type: "Interest",
          amount: 150,
          event_time: "2025-05-10 10:02:10",
          operator_wallet: "0x1234567890abcdef...",
        },
        {
          event_type: "Repaid",
          amount: 800,
          event_time: "2025-05-15 09:30:00",
          operator_wallet: "0x1234567890abcdef...",
        },
      ];
      setHistory(mock);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Event Type",
      dataIndex: "event_type",
      render: (type: string) => {
        let color = type === "Purchase" ? "green" : type === "Interest" ? "blue" : "red";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (val: number) => `$${val}`,
    },
    {
      title: "Time",
      dataIndex: "event_time",
    },
    {
      title: "Operator Wallet",
      dataIndex: "operator_wallet",
      render: (val: string) => `${val.slice(0, 6)}...${val.slice(-4)}`,
    },
  ];

  return (
    <Modal
      title={`Token History - ${tokenBatch}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Table
        rowKey={(r) => r.event_time + r.event_type}
        loading={loading}
        columns={columns}
        dataSource={history}
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

export default TokenHistoryModal;
