import {
  Button,
  Modal,
  Typography,
  Tag,
  Descriptions,
  Form,
  Input,
  DatePicker,
} from "antd";
import { InvoiceBatch } from "@/app/utils/apis";
import { tokenApi } from "@/app/utils/apis";
import { message } from "@/app/components/Message";
import dayjs from "dayjs";
import { useState } from "react";

const { Title } = Typography;

interface IssueTokenModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  selectedBatch: InvoiceBatch | null;
}

function IssueTokenModal({
  open,
  onCancel,
  onSuccess,
  selectedBatch,
}: IssueTokenModalProps) {
  const [form] = Form.useForm();
  const [isCreatingToken, setIsCreatingToken] = useState(false);

  const handleSubmit = async () => {
    if (!selectedBatch) return;
    console.log("selectedBatch", selectedBatch);
    try {
      const values = await form.validateFields();
      setIsCreatingToken(true);

      const response = await tokenApi.createToken(selectedBatch.id, {
        batch_id: selectedBatch.id,
        interest_rate_apy: values.interest_rate_apy,
        maturity_date: values.maturity_date.format("YYYY-MM-DD"),
        token_value: selectedBatch.total_amount.toString(),
        total_token_supply: selectedBatch.total_amount.toString(),
      });

      if (response.code === 200) {
        message.success("Successfully created token from batch");
        form.resetFields();
        onSuccess();
      } else {
        message.error(response.msg || "Failed to create token");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to create token. Please try again later.");
    } finally {
      setIsCreatingToken(false);
    }
  };

  return (
    <Modal
      destroyOnClose
      title="Issue Token from Batch"
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isCreatingToken}
          onClick={handleSubmit}
        >
          Confirm to Issue
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
            <Descriptions.Item label="Creditor">
              {selectedBatch.creditor_name}
            </Descriptions.Item>
            <Descriptions.Item label="Debtor">
              {selectedBatch.debtor_name}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              {selectedBatch.accepted_currency}{" "}
              {Number(selectedBatch.total_amount).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Invoice Count">
              {selectedBatch.invoice_count}
            </Descriptions.Item>
          </Descriptions>

          <Title level={5} style={{ color: "#e3e3e3ee", marginBottom: 10 }}>
            Token Parameters
          </Title>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              interest_rate_apy: "5",
              maturity_date: dayjs().add(1, "year"),
            }}
          >
            <Form.Item
              name="interest_rate_apy"
              label="Interest Rate (APY %)"
              rules={[
                { required: true, message: "Please enter interest rate" },
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message:
                    "Please enter a valid number with up to 2 decimal places",
                },
              ]}
            >
              <Input type="number" step="0.01" min="0" />
            </Form.Item>
            <Form.Item
              name="maturity_date"
              label="Maturity Date"
              rules={[
                { required: true, message: "Please select maturity date" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
}

export default IssueTokenModal;
