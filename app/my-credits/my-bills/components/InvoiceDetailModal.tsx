import { Invoice } from "@/app/utils/apis";
import { formatTime, formatTimestamp } from "@/app/utils/format";
import { Descriptions, Modal, Tag, Tooltip } from "antd";

interface InvoiceDetailModalProps {
  open: boolean;
  onCancel: () => void;
  selectedInvoices: Invoice[];
}

function InvoiceDetailModal(props: InvoiceDetailModalProps) {
  const { open, onCancel, selectedInvoices } = props;
  const selectedInvoice = selectedInvoices?.[0];
  return (
    <Modal
      destroyOnClose
      title="Invoice Details"
      open={open}
      onCancel={onCancel}
      width={800}
    >
      {selectedInvoice && (
        <Descriptions
          styles={{ label: { fontWeight: "bold" } }}
          bordered
          column={2}
          size="small"
        >
          <Descriptions.Item label="Invoice ID" span={2}>
            {selectedInvoice.id}
          </Descriptions.Item>
          <Descriptions.Item label="Invoice Number" span={2}>
            {selectedInvoice.invoice_number}
          </Descriptions.Item>
          <Descriptions.Item label="Amount">
            ${Number(selectedInvoice.amount).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Currency">
            {selectedInvoice.currency}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                selectedInvoice.status === "PENDING"
                  ? "orange"
                  : selectedInvoice.status === "VERIFIED"
                  ? "blue"
                  : selectedInvoice.status === "ISSUED"
                  ? "green"
                  : "default"
              }
            >
              {selectedInvoice.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Due Date">
            {formatTimestamp(selectedInvoice.due_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Payee" span={2}>
            <Tooltip title={selectedInvoice.payee}>
              {selectedInvoice.payee}
            </Tooltip>
          </Descriptions.Item>
          <Descriptions.Item label="Payer" span={2}>
            <Tooltip title={selectedInvoice.payer}>
              {selectedInvoice.payer}
            </Tooltip>
          </Descriptions.Item>
          <Descriptions.Item label="Contract IPFS Hash" span={2}>
            <Tooltip title={selectedInvoice.contract_ipfs_hash}>
              {selectedInvoice.contract_ipfs_hash || "Not available"}
            </Tooltip>
          </Descriptions.Item>
          <Descriptions.Item label="Invoice IPFS Hash" span={2}>
            <Tooltip title={selectedInvoice.invoice_ipfs_hash}>
              {selectedInvoice.invoice_ipfs_hash || "Not available"}
            </Tooltip>
          </Descriptions.Item>
          <Descriptions.Item label="Created At" span={2}>
            {formatTime(selectedInvoice.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At" span={2}>
            {formatTime(selectedInvoice.updated_at)}
          </Descriptions.Item>
          {/* <Descriptions.Item label="Blockchain Status" span={2}>
              {selectedInvoice.status === "VERIFIED" ? (
                <Space>
                  <Tag color="green">Verified</Tag>
                </Space>
              ) : (
                <Tag color="orange">Pending Confirmation</Tag>
              )}
            </Descriptions.Item> */}
          <Descriptions.Item label="Token Batch" span={2}>
            {selectedInvoice.token_batch || "Not available"}
          </Descriptions.Item>
          <Descriptions.Item label="Cleared Status" span={2}>
            {selectedInvoice.is_cleared === true ? (
              <Tag color="green">Cleared</Tag>
            ) : selectedInvoice.is_cleared === false ? (
              <Tag color="red">Not Cleared</Tag>
            ) : (
              "Not available"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Valid Status" span={2}>
            {selectedInvoice.is_valid === true ? (
              <Tag color="green">Valid</Tag>
            ) : selectedInvoice.is_valid === false ? (
              <Tag color="red">Invalid</Tag>
            ) : (
              "Not available"
            )}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}

export default InvoiceDetailModal;
