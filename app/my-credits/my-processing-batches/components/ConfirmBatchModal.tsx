import { Button, Modal, Typography, Tag, Descriptions } from "antd";
import { InvoiceBatch, tokenApi } from "@/app/utils/apis";
import { message } from "@/app/components/ui/Message";
import { useState, useCallback } from "react";
import { useInvoice } from "@/app/utils/contracts/useInvoice";
import { getAddress0 } from "@/app/utils/format";

const { Title } = Typography;

interface ConfirmBatchModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  selectedBatch: InvoiceBatch | null;
}

function ConfirmBatchModal({
  open,
  onCancel,
  onSuccess,
  selectedBatch,
}: ConfirmBatchModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { useConfirmTokenBatchIssue } = useInvoice();
  const { confirmTokenBatchIssue } = useConfirmTokenBatchIssue({
    onSuccess: () => {
      onSuccess();
      setIsSubmitting(false);
      updateBackend();
    },
    onError: (error) => {
      console.error(error);
      setIsSubmitting(false);
    },
  });

  const updateBackend = useCallback(async () => {
    if (!selectedBatch) return;

    // TODO: 目前有些 mock 数据，需要让后端更新下字段
    const params = {
      batch_id: selectedBatch.id,
      // TODO: 从后端获取，创建票据批次的时候（issueTokenBatch），其实有输入这个，但是后端貌似没存储
      interest_rate_apy: 5, // 5%
      // TODO: 同上
      maturity_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).valueOf(),
      token_value: selectedBatch.total_amount,
      total_token_supply: selectedBatch.total_amount,
      // TODO: 同上
      blockchain_token_id: getAddress0(),
    };

    const response = await tokenApi.createToken(params);
    if (response.code !== 200) {
      message.error("Failed to create token");
    }
  }, [selectedBatch]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    message.loading("Confirming batch on blockchain...");
    await confirmTokenBatchIssue(selectedBatch.id);
  };

  return (
    <Modal
      destroyOnClose
      title="Confirm Invoice Batch"
      open={open}
      onCancel={() => {
        if (!isSubmitting) {
          onCancel();
        }
      }}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isSubmitting}
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          Confirm
        </Button>,
      ]}
    >
      {selectedBatch && (
        <>
          <Title level={5} style={{ marginBottom: 16 }}>
            You are confirming this invoice batch as the debtor
          </Title>

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
            <Descriptions.Item label="Payer (Debtor)">
              {selectedBatch.payer}
            </Descriptions.Item>
            <Descriptions.Item label="Payee (Creditor)">
              {selectedBatch.payee}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              {selectedBatch.accepted_currency}{" "}
              {Number(selectedBatch.total_amount).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Invoice Count">
              {selectedBatch.invoice_count}
            </Descriptions.Item>
          </Descriptions>

          <p style={{ marginTop: 16 }}>
            By confirming this batch, you acknowledge these invoices as valid
            and authorize the issuance of tokens backed by these receivables.
          </p>
        </>
      )}
    </Modal>
  );
}

export default ConfirmBatchModal;
