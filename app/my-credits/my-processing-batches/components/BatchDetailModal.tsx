import { Button, Modal, Typography, Tag, Descriptions, Table } from "antd";
import { InvoiceBatch, Invoice } from "@/app/utils/apis";
import dayjs from "dayjs";

const { Title } = Typography;

interface BatchDetailModalProps {
  open: boolean;
  onCancel: () => void;
  selectedBatch: InvoiceBatch | null;
  selectedBatchInvoices: Invoice[];
}

function BatchDetailModal(params: BatchDetailModalProps) {
  const { open, onCancel, selectedBatch, selectedBatchInvoices } = params;

  return (
    <Modal
      destroyOnClose
      title="Batch Details"
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
      ]}
    >
      {selectedBatch && (
        <>
          <Descriptions
            styles={{ label: { fontWeight: "bold" } }}
            bordered
            column={2}
            size="small"
            className="mb-6"
          >
            <Descriptions.Item label="Batch ID">
              {selectedBatch.id}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  selectedBatch.status === "PENDING"
                    ? "orange"
                    : selectedBatch.status === "VERIFIED"
                    ? "blue"
                    : selectedBatch.status === "ISSUED"
                    ? "green"
                    : "default"
                }
              >
                {selectedBatch.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payer" span={1}>
              {selectedBatch.payer}
            </Descriptions.Item>
            <Descriptions.Item label="Payee" span={1}>
              {selectedBatch.payee}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount" span={1}>
              {selectedBatch.accepted_currency}{" "}
              {Number(selectedBatch.total_amount).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Invoice Count" span={1}>
              {selectedBatch.invoice_count}
            </Descriptions.Item>

            <Descriptions.Item label="Created At" span={2}>
              {dayjs(selectedBatch.created_at).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="Token Batch ID" span={2}>
              {selectedBatch.token_batch_id || "Not available"}
            </Descriptions.Item>
          </Descriptions>

          <Title
            level={5}
            style={{
              color: "#e3e3e3ee",
              marginBottom: 10,
            }}
          >
            Invoices in this Batch
          </Title>
          <Table
            columns={[
              {
                title: "Invoice Number",
                dataIndex: "invoice_number",
                key: "invoice_number",
              },
              {
                title: "Amount",
                dataIndex: "amount",
                key: "amount",
                render: (amount: number, record: Invoice) =>
                  `${record.currency} ${Number(amount).toLocaleString()}`,
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
                render: (timestamp: number) =>
                  dayjs(timestamp * 1000).format("YYYY-MM-DD HH:mm"),
              },
            ]}
            dataSource={selectedBatchInvoices}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </>
      )}
    </Modal>
  );
}

export default BatchDetailModal;
