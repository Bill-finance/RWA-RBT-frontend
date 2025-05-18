import HashText from "@/app/components/ui/HashText";
import { message } from "@/app/components/ui/Message";
import { Invoice, invoiceApi } from "@/app/utils/apis/invoice";
import { formatTimestamp } from "@/app/utils/format";
import { CheckOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Space, Tag, Tooltip } from "antd";

export const getTableColumns = (props) => {
  const {
    processingIds,
    address,
    selectedInvoices,
    handleCheck,
    handleViewDetail,
    handleVerify,
  } = props;
  const columns = [
    {
      title: "",
      key: "select",
      fixed: "left",
      width: 64,
      align: "center" as const,
      // Antd 的 Checkbox 不够灵活
      render: (_: unknown, record: Invoice) => {
        const isPayee = record.payee === address;
        const isDisabled =
          !isPayee ||
          record.status !== "VERIFIED" ||
          processingIds.includes(record.id);

        return (
          <Input
            style={{
              height: 16,
              width: 16,
              textAlign: "center",
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
            type="checkbox"
            disabled={isDisabled}
            checked={selectedInvoices.includes(record.id)}
            onChange={(e) => handleCheck(e, record)}
          />
        );
      },
    },
    // {
    //   title: "Invoice ID",
    //   dataIndex: "id",
    //   key: "id",
    //   render: (text: string, record: Invoice) => (
    //     <a onClick={() => handleViewDetail(record)}>{text}</a>
    //   ),
    // },
    {
      title: "Invoice Number",
      dataIndex: "invoice_number",
      key: "invoice_number",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${Number(amount).toLocaleString()}`,
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
      width: 100,
    },
    {
      title: "Payee",
      dataIndex: "payee",
      key: "payee",
      width: 150,
      render: (text: string) => <HashText text={text} />,
    },
    {
      title: "Payer",
      dataIndex: "payer",
      key: "payer",
      width: 150,
      render: (text: string) => <HashText text={text} />,
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
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (timestamp: number) => formatTimestamp(timestamp),
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      // width: 64,
      render: (_: unknown, record: Invoice) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === "PENDING" && address === record.payee && (
            <Tooltip title="Verify">
              <Button
                icon={<CheckOutlined />}
                type="text"
                loading={processingIds.includes(record.id)}
                onClick={() => handleVerify(record.invoice_number, record.id)}
              />
            </Tooltip>
          )}
          {/* {record.status === "VERIFIED" && (
            <Button
              type="primary"
              size="small"
              loading={processingIds.includes(record.id)}
              onClick={() => {
                setSelectedInvoices([record.id]);
                handleIssueInvoices();
              }}
            >
              Issue
            </Button>
          )} */}
        </Space>
      ),
    },
  ];

  return columns;
};

export const loadInvoices = async ({ setIsLoading, setInvoices }) => {
  setIsLoading(true);
  try {
    const response = await invoiceApi.list();
    if (response.code === 200) {
      setInvoices(response.data);
    } else {
      Modal.error({
        title: "Failed to load invoices",
        content: response.msg || "Could not retrieve invoices data",
      });
    }
  } catch (error) {
    console.error(error);
    message.error("Failed to load invoices. Please try again later.");
  } finally {
    setIsLoading(false);
  }
};
