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
  Tooltip,
  Statistic,
  Row,
  Col,
  Progress,
  Descriptions,
  Empty,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

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
  daysPastDue: number;
  status: "active" | "repaid" | "overdue";
  description: string;
  creationDate: string;
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
}

const generateMockDebts = (): Debt[] => {
  const stablecoins = ["USDT", "USDC", "DAI"];
  const statuses: ("active" | "repaid" | "overdue")[] = [
    "active",
    "active",
    "overdue",
    "active",
    "active",
  ];
  const documentTypes = ["Contract", "Invoice", "Receipt", "Agreement"];

  return Array.from({ length: 5 }, (_, index) => {
    const totalAmount = Math.floor(Math.random() * 1000000) + 100000;
    const repaidAmount = Math.floor(Math.random() * (totalAmount * 0.5));
    const remainingAmount = totalAmount - repaidAmount;
    const interestRate = Math.floor(Math.random() * 15) + 5; // 5-20% interest rate
    const interestAmount = Math.floor((totalAmount * interestRate) / 100);
    const status = statuses[index];
    const daysPastDue =
      status === "overdue" ? Math.floor(Math.random() * 60) + 1 : 0;

    // Generate random document array
    const numDocs = Math.floor(Math.random() * 3) + 1;
    const documents = Array.from({ length: numDocs }, (_, docIndex) => {
      const docType =
        documentTypes[Math.floor(Math.random() * documentTypes.length)];
      return {
        id: `doc-${index}-${docIndex}`,
        name: `${docType} #${(index + 1).toString().padStart(4, "0")}-${
          docIndex + 1
        }`,
        type: docType,
        url: `https://example.com/documents/${index}/${docIndex}`,
      };
    });

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
      daysPastDue,
      status,
      description: `This is a debt for services rendered to ${
        index % 2 === 0 ? "Company A" : "Company B"
      } related to ${
        index % 3 === 0
          ? "Product Development"
          : index % 3 === 1
          ? "Consulting Services"
          : "Equipment Purchase"
      }`,
      creationDate: new Date(
        Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      documents,
    };
  });
};

export default function MyCurrentDebtsPage() {
  const { isConnected } = useAccount();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

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
        message.error("Failed to load current debts");
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      loadDebts();
    }
  }, [isConnected]);

  const handleViewDetail = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowDetailModal(true);
  };

  const handleViewDocuments = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowDocumentsModal(true);
  };

  const handleViewBreakdown = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowBreakdownModal(true);
  };

  // Calculate summary statistics
  const totalDebt = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  const totalInitialDebt = debts.reduce(
    (sum, debt) => sum + debt.totalAmount,
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
      title: "Initial Amount",
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
      title: "Maturity Date",
      dataIndex: "maturityDate",
      key: "maturityDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: Debt) => {
        let color = "green";
        let text = status.toUpperCase();

        if (status === "overdue") {
          color = "red";
          text = `OVERDUE (${record.daysPastDue} days)`;
        }
        if (status === "repaid") color = "blue";

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Debt) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="View Documents">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => handleViewDocuments(record)}
            />
          </Tooltip>
          <Tooltip title="Payment Breakdown">
            <Button
              type="text"
              icon={<PieChartOutlined />}
              onClick={() => handleViewBreakdown(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} style={{ color: "#e5e7eb", marginBottom: 24 }}>
        My Current Debts
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
              title={<span className="text-zinc-400">Total Initial Debt</span>}
              value={totalInitialDebt}
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
          locale={{
            emptyText: (
              <Empty
                description={
                  <span className="text-gray-500">No current debts found</span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Debt Details"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>,
        ]}
        width={700}
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
          <Descriptions
            bordered
            column={2}
            size="small"
            className="bg-zinc-800 rounded text-gray-300"
            labelStyle={{ color: "#a3a3a3" }}
            contentStyle={{ color: "#e5e7eb" }}
          >
            <Descriptions.Item label="Token Batch" span={2}>
              {selectedDebt.tokenBatchNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Creditor">
              {selectedDebt.creditorName}
            </Descriptions.Item>
            <Descriptions.Item label="Creditor Address">
              {`${selectedDebt.creditorAddress.substring(
                0,
                8
              )}...${selectedDebt.creditorAddress.substring(
                selectedDebt.creditorAddress.length - 8
              )}`}
            </Descriptions.Item>
            <Descriptions.Item label="Stablecoin">
              {selectedDebt.stablecoin}
            </Descriptions.Item>
            <Descriptions.Item label="Interest Rate">
              {selectedDebt.interestRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Initial Amount">
              ${selectedDebt.totalAmount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Remaining Amount">
              ${selectedDebt.remainingAmount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Repaid Amount">
              ${selectedDebt.repaidAmount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Interest Amount">
              ${selectedDebt.interestAmount.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Creation Date">
              {selectedDebt.creationDate}
            </Descriptions.Item>
            <Descriptions.Item label="Next Payment Due">
              {selectedDebt.nextPaymentDue}
            </Descriptions.Item>
            <Descriptions.Item label="Maturity Date">
              {selectedDebt.maturityDate}
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>
              <Tag
                color={
                  selectedDebt.status === "overdue"
                    ? "red"
                    : selectedDebt.status === "repaid"
                    ? "blue"
                    : "green"
                }
              >
                {selectedDebt.status.toUpperCase()}
                {selectedDebt.status === "overdue" &&
                  ` (${selectedDebt.daysPastDue} days)`}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedDebt.description}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Documents Modal */}
      <Modal
        title="Debt Documents"
        open={showDocumentsModal}
        onCancel={() => setShowDocumentsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDocumentsModal(false)}>
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
        {selectedDebt && (
          <div className="text-gray-300">
            <p className="mb-4">
              Documents for debt{" "}
              <strong className="text-gray-200">
                {selectedDebt.tokenBatchNumber}
              </strong>
              :
            </p>
            {selectedDebt.documents.length > 0 ? (
              <ul className="list-disc pl-5">
                {selectedDebt.documents.map((doc) => (
                  <li key={doc.id} className="mb-2">
                    <div className="flex justify-between items-center">
                      <span>
                        <FileTextOutlined className="mr-2 text-blue-400" />
                        {doc.name}{" "}
                        <span className="text-gray-500">({doc.type})</span>
                      </span>
                      <Button
                        type="link"
                        onClick={() =>
                          message.info(`Document would open: ${doc.url}`)
                        }
                        className="text-blue-400 hover:text-blue-300"
                      >
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty
                description={
                  <span className="text-gray-500">No documents found</span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Breakdown Modal */}
      <Modal
        title="Payment Breakdown"
        open={showBreakdownModal}
        onCancel={() => setShowBreakdownModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowBreakdownModal(false)}>
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
        {selectedDebt && (
          <div className="text-gray-300">
            <p className="mb-4">
              Payment breakdown for{" "}
              <strong className="text-gray-200">
                {selectedDebt.tokenBatchNumber}
              </strong>
              :
            </p>

            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <Card className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-md">
                  <Statistic
                    title={<span className="text-zinc-400">Principal</span>}
                    value={
                      selectedDebt.totalAmount - selectedDebt.interestAmount
                    }
                    precision={0}
                    prefix="$"
                    valueStyle={{ color: "#e5e7eb" }}
                    formatter={(value) => `${value.toLocaleString()}`}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-md">
                  <Statistic
                    title={<span className="text-zinc-400">Interest</span>}
                    value={selectedDebt.interestAmount}
                    precision={0}
                    prefix="$"
                    valueStyle={{ color: "#fa8c16" }}
                    formatter={(value) => `${value.toLocaleString()}`}
                  />
                </Card>
              </Col>
            </Row>

            <Card className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-md mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Total Debt:</span>
                <span className="text-gray-200">
                  ${selectedDebt.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Repaid Amount:</span>
                <span className="text-green-400">
                  ${selectedDebt.repaidAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Remaining Amount:</span>
                <span className="text-red-400">
                  ${selectedDebt.remainingAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Payoff Complete By:</span>
                <span className="text-gray-200">
                  {selectedDebt.maturityDate}
                </span>
              </div>
            </Card>

            <Card className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-md">
              <div className="flex items-center justify-center">
                <div className="w-full">
                  <Progress
                    percent={Math.round(
                      (selectedDebt.repaidAmount / selectedDebt.totalAmount) *
                        100
                    )}
                    status={
                      selectedDebt.status === "overdue" ? "exception" : "active"
                    }
                    format={(percent) => (
                      <span className="text-gray-200">{percent}% Repaid</span>
                    )}
                  />
                  <div className="flex justify-between mt-4 text-gray-400">
                    <span>
                      <CalendarOutlined className="mr-1 text-blue-400" />
                      Created:{" "}
                      <span className="text-gray-300">
                        {selectedDebt.creationDate}
                      </span>
                    </span>
                    <span>
                      <CalendarOutlined className="mr-1 text-blue-400" />
                      Due:{" "}
                      <span className="text-gray-300">
                        {selectedDebt.maturityDate}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
