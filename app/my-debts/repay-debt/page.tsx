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
  Modal,
  InputNumber,
  Tooltip,
  Statistic,
  Row,
  Col,
  Progress,
} from "antd";
import { DollarOutlined, HistoryOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

// Mock data for debts
interface Debt {
  id: string;
  tokenBatchNumber: string;
  creditorName: string;
  creditorAddress: string;
  stablecoin: string;
  totalAmount: number;
  remainingAmount: number;
  repaidAmount: number;
  interestRate: number;
  interestAmount: number;
  nextPaymentDue: string;
  maturityDate: string;
  isOverdue: boolean;
  status: "active" | "repaid" | "overdue";
}

const generateMockDebts = (): Debt[] => {
  const stablecoins = ["USDT", "USDC", "DAI"];
  const statuses: ("active" | "repaid" | "overdue")[] = [
    "active",
    "repaid",
    "overdue",
  ];

  return Array.from({ length: 5 }, (_, index) => {
    const totalAmount = Math.floor(Math.random() * 1000000) + 100000;
    const repaidAmount = Math.floor(Math.random() * totalAmount);
    const remainingAmount = totalAmount - repaidAmount;
    const interestRate = Math.floor(Math.random() * 15) + 5; // 5-20% interest rate
    const interestAmount = Math.floor((totalAmount * interestRate) / 100);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isOverdue = status === "overdue";

    return {
      id: `d-${index + 1}`,
      tokenBatchNumber: `BATCH-${(index + 1).toString().padStart(4, "0")}`,
      creditorName: `Creditor ${index + 1}`,
      creditorAddress: `0x${Math.random().toString(16).slice(2, 40)}`,
      stablecoin: stablecoins[Math.floor(Math.random() * stablecoins.length)],
      totalAmount,
      remainingAmount,
      repaidAmount,
      interestRate,
      interestAmount,
      nextPaymentDue: new Date(
        Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      maturityDate: new Date(
        Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      isOverdue,
      status,
    };
  });
};

// Mock data for repayment history
interface RepaymentHistory {
  id: string;
  debtId: string;
  amount: number;
  timestamp: string;
  txHash: string;
}

const generateMockRepaymentHistory = (debtId: string): RepaymentHistory[] => {
  return Array.from(
    { length: Math.floor(Math.random() * 5) + 1 },
    (_, index) => {
      return {
        id: `r-${debtId}-${index + 1}`,
        debtId,
        amount: Math.floor(Math.random() * 100000) + 10000,
        timestamp: new Date(
          Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        txHash: `0x${Math.random().toString(16).slice(2, 64)}`,
      };
    }
  );
};

export default function RepayDebtPage() {
  const { isConnected } = useAccount();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState<number | null>(null);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [repaymentHistory, setRepaymentHistory] = useState<RepaymentHistory[]>(
    []
  );

  // Load debts when component mounts
  useEffect(() => {
    const loadDebts = async () => {
      setIsLoading(true);
      try {
        // This would be replaced with an actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setDebts(generateMockDebts());
      } catch (error) {
        console.error(error);
        message.error("Failed to load debts");
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      loadDebts();
    }
  }, [isConnected]);

  const handleRepay = (debt: Debt) => {
    setSelectedDebt(debt);
    setRepaymentAmount(null);
    setShowRepayModal(true);
  };

  const handleConfirmRepay = () => {
    if (!selectedDebt || !repaymentAmount) {
      message.warning("Please enter a valid amount");
      return;
    }

    if (repaymentAmount > (selectedDebt.remainingAmount || 0)) {
      message.error("Repayment amount exceeds remaining debt");
      return;
    }

    // In a real app, this would call a contract method
    message.success(
      `Successfully repaid ${repaymentAmount} ${selectedDebt.stablecoin} of debt ${selectedDebt.tokenBatchNumber}`
    );

    // Update local state
    setDebts(
      debts.map((debt) => {
        if (debt.id === selectedDebt.id) {
          const updatedRemainingAmount = debt.remainingAmount - repaymentAmount;
          const updatedRepaidAmount = debt.repaidAmount + repaymentAmount;

          return {
            ...debt,
            remainingAmount: updatedRemainingAmount,
            repaidAmount: updatedRepaidAmount,
            status: updatedRemainingAmount <= 0 ? "repaid" : debt.status,
          };
        }
        return debt;
      })
    );

    setShowRepayModal(false);
  };

  const handleViewHistory = (debt: Debt) => {
    setSelectedDebt(debt);
    // Generate mock history for this debt
    setRepaymentHistory(generateMockRepaymentHistory(debt.id));
    setShowHistoryModal(true);
  };

  // Calculate summary statistics
  const totalDebt = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  const totalInterest = debts.reduce(
    (sum, debt) => sum + debt.interestAmount,
    0
  );
  const totalRepaid = debts.reduce((sum, debt) => sum + debt.repaidAmount, 0);
  const activeDebts = debts.filter((debt) => debt.status === "active").length;
  const overdueDebts = debts.filter((debt) => debt.status === "overdue").length;

  const columns = [
    {
      title: "Token Batch",
      dataIndex: "tokenBatchNumber",
      key: "tokenBatchNumber",
    },
    {
      title: "Creditor",
      dataIndex: "creditorName",
      key: "creditorName",
    },
    {
      title: "Stablecoin",
      dataIndex: "stablecoin",
      key: "stablecoin",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Remaining Amount",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Repaid Amount",
      dataIndex: "repaidAmount",
      key: "repaidAmount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Progress",
      key: "progress",
      render: (_: unknown, record: Debt) => {
        const percentage = Math.round(
          (record.repaidAmount / record.totalAmount) * 100
        );
        return (
          <Progress
            percent={percentage}
            size="small"
            status={record.status === "overdue" ? "exception" : undefined}
          />
        );
      },
    },
    {
      title: "Interest Rate",
      dataIndex: "interestRate",
      key: "interestRate",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "Next Payment Due",
      dataIndex: "nextPaymentDue",
      key: "nextPaymentDue",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "green";
        if (status === "overdue") color = "red";
        if (status === "repaid") color = "blue";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Debt) => (
        <Space>
          <Tooltip title="Repay Debt">
            <Button
              type="primary"
              icon={<DollarOutlined />}
              disabled={
                record.status === "repaid" || record.remainingAmount <= 0
              }
              onClick={() => handleRepay(record)}
            >
              Repay
            </Button>
          </Tooltip>
          <Tooltip title="View History">
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "Date",
      dataIndex: "timestamp",
      key: "timestamp",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Transaction Hash",
      dataIndex: "txHash",
      key: "txHash",
      render: (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-8)}`,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} style={{ color: "#e5e7eb", marginBottom: 24 }}>
        Debt Repayment
      </Title>

      {/* Summary Cards */}
      <Row gutter={16} className="mb-8">
        <Col span={6}>
          <Card className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={
                <span className="text-zinc-400">Total Outstanding Debt</span>
              }
              value={totalDebt}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              prefix="$"
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-zinc-400">Total Interest Due</span>}
              value={totalInterest}
              precision={0}
              valueStyle={{ color: "#fa8c16" }}
              prefix="$"
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title={<span className="text-zinc-400">Total Repaid</span>}
              value={totalRepaid}
              precision={0}
              valueStyle={{ color: "#3f8600" }}
              prefix="$"
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Row>
              <Col span={12}>
                <Statistic
                  title={<span className="text-zinc-400">Active Debts</span>}
                  value={activeDebts}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span className="text-zinc-400">Overdue</span>}
                  value={overdueDebts}
                  valueStyle={{ color: "#cf1322" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Debts Table */}
      <Card
        className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-md"
        styles={{
          header: {
            backgroundColor: "#202020",
            borderBottom: "1px solid #303030",
          },
          body: { backgroundColor: "#101010" },
        }}
      >
        <Table
          columns={columns}
          dataSource={debts}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1500 }}
          className="text-gray-300"
          rowClassName="hover:bg-zinc-800"
        />
      </Card>

      {/* Repay Modal */}
      <Modal
        title="Repay Debt"
        open={showRepayModal}
        onCancel={() => setShowRepayModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowRepayModal(false)}>
            Cancel
          </Button>,
          <Button
            key="repay"
            type="primary"
            onClick={handleConfirmRepay}
            disabled={!repaymentAmount}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Confirm Repayment
          </Button>,
        ]}
        className="dark-modal"
        styles={{
          content: {
            backgroundColor: "#111111",
            color: "#e5e7eb",
            border: "1px solid #333333",
          },
          header: {
            backgroundColor: "#111111",
            borderBottom: "1px solid #333333",
            color: "#e5e7eb",
          },
          body: {
            backgroundColor: "#111111",
            color: "#e5e7eb",
          },
          footer: {
            backgroundColor: "#111111",
            borderTop: "1px solid #333333",
          },
        }}
      >
        {selectedDebt && (
          <div className="text-gray-300">
            <p>
              <strong className="text-gray-200">Token Batch:</strong>{" "}
              {selectedDebt.tokenBatchNumber}
            </p>
            <p>
              <strong className="text-gray-200">Creditor:</strong>{" "}
              {selectedDebt.creditorName}
            </p>
            <p>
              <strong className="text-gray-200">Stablecoin:</strong>{" "}
              {selectedDebt.stablecoin}
            </p>
            <p>
              <strong className="text-gray-200">Remaining Amount:</strong> $
              {selectedDebt.remainingAmount.toLocaleString()}
            </p>

            <div className="mt-4">
              <Text strong className="text-gray-200">
                Repayment Amount
              </Text>
              <InputNumber
                style={{ width: "100%", marginTop: 8 }}
                min={1}
                max={selectedDebt.remainingAmount}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ""))}
                onChange={(value) => setRepaymentAmount(value)}
                className="bg-zinc-800 border-zinc-700 text-gray-200"
              />

              <div className="flex justify-between mt-4">
                <Button
                  onClick={() =>
                    setRepaymentAmount(
                      Math.floor(selectedDebt.remainingAmount * 0.25)
                    )
                  }
                  className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
                >
                  25%
                </Button>
                <Button
                  onClick={() =>
                    setRepaymentAmount(
                      Math.floor(selectedDebt.remainingAmount * 0.5)
                    )
                  }
                  className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
                >
                  50%
                </Button>
                <Button
                  onClick={() =>
                    setRepaymentAmount(
                      Math.floor(selectedDebt.remainingAmount * 0.75)
                    )
                  }
                  className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
                >
                  75%
                </Button>
                <Button
                  onClick={() =>
                    setRepaymentAmount(selectedDebt.remainingAmount)
                  }
                  type="primary"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  100%
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        title={`Repayment History - ${selectedDebt?.tokenBatchNumber}`}
        open={showHistoryModal}
        onCancel={() => setShowHistoryModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowHistoryModal(false)}>
            Close
          </Button>,
        ]}
        className="dark-modal"
        styles={{
          content: {
            backgroundColor: "#111111",
            color: "#e5e7eb",
            border: "1px solid #333333",
          },
          header: {
            backgroundColor: "#111111",
            borderBottom: "1px solid #333333",
            color: "#e5e7eb",
          },
          body: {
            backgroundColor: "#111111",
            color: "#e5e7eb",
          },
          footer: {
            backgroundColor: "#111111",
            borderTop: "1px solid #333333",
          },
        }}
      >
        <Table
          columns={historyColumns}
          dataSource={repaymentHistory}
          rowKey="id"
          pagination={false}
          className="text-gray-300"
          rowClassName="hover:bg-zinc-800"
          style={{ backgroundColor: "#111111" }}
        />
      </Modal>
    </div>
  );
}
