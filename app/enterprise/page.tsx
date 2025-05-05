"use client";

import {
  Table,
  Card,
  Space,
  Tooltip,
  message,
  Typography,
  Modal,
  Form,
  Input,
  Button,
} from "antd";
import { useEffect, useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import { enterpriseApi } from "../utils/apis";
import { EnterpriseResponse } from "./types";

const { Title } = Typography;

interface Enterprise {
  _id: string;
  name: string;
  walletAddress: string;
  status: string;
  kycDetailsIpfsHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function EnterprisePage() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentEnterprise, setCurrentEnterprise] = useState<Enterprise | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [form] = Form.useForm();

  const loadEnterprises = async () => {
    setIsLoading(true);
    try {
      const response = await enterpriseApi.list();
      if (response?.code === 200 && Array.isArray(response.data)) {
        const formattedData = response.data.map((item: EnterpriseResponse) => ({
          _id: item.id,
          name: item.name,
          walletAddress: item.wallet_address,
          status: item.status,
          kycDetailsIpfsHash: item.kyc_details_ipfs_hash,
          createdAt: new Date(
            Number(item.created_at.$date.$numberLong)
          ).toLocaleString("en-US"),
          updatedAt: new Date(
            Number(item.updated_at.$date.$numberLong)
          ).toLocaleString("en-US"),
        }));
        setEnterprises(formattedData);
      } else {
        message.error("Failed to load enterprise list");
      }
    } catch (err: unknown) {
      console.error("Error loading enterprises:", err);
      message.error("Failed to load enterprise list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnterprises();
  }, []);

  // 查看详情
  const handleDetail = async (record: Enterprise) => {
    setDetailLoading(true);
    try {
      const res = await enterpriseApi.getById(record._id);
      if (res?.code === 200 && res.data) {
        setCurrentEnterprise({
          _id: res.data.id,
          name: res.data.name,
          walletAddress: res.data.wallet_address,
          status: res.data.status,
          kycDetailsIpfsHash: res.data.kyc_details_ipfs_hash,
          createdAt: new Date(
            Number(res.data.created_at.$date.$numberLong)
          ).toLocaleString("en-US"),
          updatedAt: new Date(
            Number(res.data.updated_at.$date.$numberLong)
          ).toLocaleString("en-US"),
        });
        setShowDetailModal(true);
      } else {
        message.error("Failed to fetch details");
      }
    } catch {
      message.error("Failed to fetch details");
    } finally {
      setDetailLoading(false);
    }
  };

  // 新增企业
  const handleAdd = () => {
    form.resetFields();
    setShowAddModal(true);
  };
  const handleAddSubmit = async () => {
    try {
      const values = await form.validateFields();
      await enterpriseApi.create({
        name: values.name,
        walletAddress: values.walletAddress,
      });
      message.success("Enterprise created");
      setShowAddModal(false);
      loadEnterprises();
    } catch {
      // 校验失败或接口失败
    }
  };

  // 编辑企业
  const handleEdit = () => {
    if (!currentEnterprise) return;
    form.setFieldsValue({
      name: currentEnterprise.name,
      walletAddress: currentEnterprise.walletAddress,
    });
    setShowEditModal(true);
  };
  const handleEditSubmit = async () => {
    if (!currentEnterprise) return;
    try {
      const values = await form.validateFields();
      await enterpriseApi.update(currentEnterprise._id, {
        name: values.name,
        walletAddress: values.walletAddress,
      });
      message.success("Enterprise updated");
      setShowEditModal(false);
      setShowDetailModal(false);
      loadEnterprises();
    } catch {
      // 校验失败或接口失败
    }
  };

  // 删除企业
  const handleDelete = (record: Enterprise) => {
    Modal.confirm({
      title: `Delete enterprise "${record.name}"?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await enterpriseApi.delete(record._id);
          message.success("Enterprise deleted");
          loadEnterprises();
        } catch {
          message.error("Failed to delete");
        }
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Wallet Address",
      dataIndex: "walletAddress",
      key: "walletAddress",
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{`${text.slice(0, 6)}...${text.slice(-4)}`}</span>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          style={{
            color:
              status === "PendingVerification"
                ? "#faad14"
                : status === "Verified"
                ? "#52c41a"
                : "#ff4d4f",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Enterprise) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleDetail(record)}
            />
          </Tooltip>
          {/* <Tooltip title="Edit">
            <Button
              onClick={async () => {
                await handleDetail(record);
                handleEdit();
              }}
            >
              Edit
            </Button>
          </Tooltip> */}
          <Tooltip title="Delete">
            <Button danger onClick={() => handleDelete(record)}>
              Delete
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Title level={2}>Enterprise List</Title>
        <Button type="primary" onClick={handleAdd}>
          Connect My Enterprise
        </Button>
      </div>
      <Card className="mb-6">
        <Table
          loading={isLoading}
          dataSource={enterprises}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
      {/* 详情弹窗 */}
      <Modal
        open={showDetailModal}
        title="Enterprise Details"
        onCancel={() => setShowDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>,
          <Button key="edit" type="primary" onClick={handleEdit}>
            Edit
          </Button>,
        ]}
        confirmLoading={detailLoading}
      >
        {currentEnterprise && (
          <div>
            <p>
              <b>Name:</b> {currentEnterprise.name}
            </p>
            <p>
              <b>Wallet Address:</b> {currentEnterprise.walletAddress}
            </p>
            <p>
              <b>Status:</b> {currentEnterprise.status}
            </p>
            <p>
              <b>KYC Hash:</b> {currentEnterprise.kycDetailsIpfsHash || "-"}
            </p>
            <p>
              <b>Created At:</b> {currentEnterprise.createdAt}
            </p>
            <p>
              <b>Updated At:</b> {currentEnterprise.updatedAt}
            </p>
          </div>
        )}
      </Modal>
      {/* 新增弹窗 */}
      <Modal
        open={showAddModal}
        title="Connect My Enterprise"
        onCancel={() => setShowAddModal(false)}
        onOk={handleAddSubmit}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="walletAddress"
            label="Wallet Address"
            rules={[{ required: true, message: "Please input wallet address" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      {/* 编辑弹窗 */}
      <Modal
        open={showEditModal}
        title="Edit Enterprise"
        onCancel={() => setShowEditModal(false)}
        onOk={handleEditSubmit}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="walletAddress"
            label="Wallet Address"
            rules={[{ required: true, message: "Please input wallet address" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
