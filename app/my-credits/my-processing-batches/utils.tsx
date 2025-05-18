import HashText from "@/app/components/ui/HashText";
import { InvoiceBatch } from "@/app/utils/apis";
import { CheckOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Space, Tag, Tooltip } from "antd";

interface TableColumnsProps {
  address: string;
  handleViewDetail: (record: InvoiceBatch) => void;
  handleConfirmBatch: (record: InvoiceBatch) => void;
}

export const getTableColumns = ({
  address,
  handleViewDetail,
  handleConfirmBatch,
}: TableColumnsProps) => {
  const columns = [
    {
      title: "Payee",
      dataIndex: "payee",
      key: "payee",
      render: (text: string) => <HashText text={text} />,
    },
    {
      title: "Payer",
      dataIndex: "payer",
      key: "payer",
      render: (text: string) => <HashText text={text} />,
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (amount: number, record: InvoiceBatch) =>
        `${record.accepted_currency} ${Number(amount).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        let color = "default";
        if (text === "PENDING") color = "orange";
        if (text === "VERIFIED") color = "blue";
        if (text === "ISSUED") color = "green";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => (text ? text.slice(0, 10) : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: InvoiceBatch) => {
        return (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>

            {address && record.payer === address && (
              <Tooltip title="Confirm Batch">
                <Button
                  type="text"
                  onClick={() => handleConfirmBatch(record)}
                  icon={<CheckOutlined />}
                  // icon={<SendOutlined rotate={-45} />}
                />
              </Tooltip>
            )}

            {/* {address &&
              record.payer?.toLowerCase() === address.toLowerCase() && (
                <Tooltip title="Issue Token">
                  <Button
                    type="text"
                    onClick={() => handleIssueToken(record)}
                    icon={<SendOutlined rotate={-45} />}
                  />
                </Tooltip>
              )} */}
          </Space>
        );
      },
    },
  ];

  return columns;
};
