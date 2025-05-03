"use client";

import { Modal, Descriptions } from "antd";
import { TokenInfo } from "../types";

interface Props {
  open: boolean;
  token: TokenInfo | null;
  onClose: () => void;
}

export default function TokenDetailModal({ open, token, onClose }: Props) {
  return (
    <Modal
      title="Token Details"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {token && (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Token Batch">
            {token.token_batch}
          </Descriptions.Item>
          <Descriptions.Item label="Creditor">
            {token.creditor}
          </Descriptions.Item>
          <Descriptions.Item label="Debtor">
            {token.debtor}
          </Descriptions.Item>
          <Descriptions.Item label="Stablecoin">
            {token.stablecoin}
          </Descriptions.Item>
          <Descriptions.Item label="Ticket Quantity">
            {token.ticket_quantity}
          </Descriptions.Item>
          <Descriptions.Item label="Issued Amount">
            {token.total_issued_amount?.toString()}
          </Descriptions.Item>
          <Descriptions.Item label="Debtor Signed">
            {token.debtor_signed ? "Yes" : "No"}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {token.created_at}
          </Descriptions.Item>
          <Descriptions.Item label="Wallet Created">
            {token.wallet_created}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {token.updated_at}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
