"use client";

import { useState } from "react";
import { Row, Col, Space, Typography, Divider } from "antd";
import {
  DollarOutlined,
  CheckOutlined,
  CloseOutlined,
  WalletOutlined,
} from "@ant-design/icons";

// Import custom UI components
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Tag from "../../components/ui/Tag";
import WalletButton from "../../components/ui/WalletButton";

const { Title, Text } = Typography;

export default function UiComponentsPage() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} style={{ color: "#e5e7eb", marginBottom: 24 }}>
        UI Components Demo
      </Title>

      {/* Button Components */}
      <Card title="Button Components" className="mb-8">
        <Space direction="vertical" size="large" className="w-full">
          <Space wrap>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="link">Link Button</Button>
            <Button variant="danger">Danger Button</Button>
          </Space>

          <Space wrap>
            <Button variant="primary" animated>
              Animated Button
            </Button>
            <Button variant="gradient" animated>
              Gradient Button
            </Button>
            <Button variant="danger" animated>
              Danger Button
            </Button>
          </Space>

          <Space wrap>
            <Button variant="primary" icon={<DollarOutlined />}>
              With Icon
            </Button>
            <Button variant="gradient" glowing>
              Glowing Button
            </Button>
            <Button variant="danger" glowing>
              Danger Glowing
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Tag Components */}
      <Card title="Tag Components" className="mb-8">
        <Space wrap>
          <Tag variant="active">ACTIVE</Tag>
          <Tag variant="expired">EXPIRED</Tag>
          <Tag variant="overdue">OVERDUE</Tag>
          <Tag variant="repaid">REPAID</Tag>
          <Tag variant="pending">PENDING</Tag>

          <Divider type="vertical" />

          <Tag variant="active" glow>
            ACTIVE
          </Tag>
          <Tag variant="expired" glow>
            EXPIRED
          </Tag>
          <Tag variant="overdue" glow>
            OVERDUE
          </Tag>
          <Tag variant="repaid" glow>
            REPAID
          </Tag>
          <Tag variant="pending" glow>
            PENDING
          </Tag>

          <Divider type="vertical" />

          <Tag color="green">Custom Green</Tag>
          <Tag color="red">Custom Red</Tag>
          <Tag color="blue">Custom Blue</Tag>
          <Tag color="orange">Custom Orange</Tag>
          <Tag color="purple">Custom Purple</Tag>
        </Space>
      </Card>

      {/* Wallet Button */}
      <Card title="Wallet Button" className="mb-8">
        <Space direction="vertical" size="large">
          <div>
            <Space size="large">
              <WalletButton
                isConnected={isConnected}
                address={isConnected ? "0x7959...c069" : undefined}
                onConnect={() => setIsConnected(true)}
                onDisconnect={() => setIsConnected(false)}
              />

              <Button
                variant={isConnected ? "danger" : "primary"}
                onClick={() => setIsConnected(!isConnected)}
              >
                {isConnected ? "Disconnect" : "Connect Wallet"}
              </Button>
            </Space>
          </div>

          <div className="flex space-x-4">
            <Button variant="gradient" icon={<WalletOutlined />} animated>
              Connect
            </Button>
            <Button variant="outline" animated>
              <Space>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                0x7959...c069
              </Space>
            </Button>
          </div>
        </Space>
      </Card>

      {/* Card Styles */}
      <Title level={3} style={{ color: "#e5e7eb", margin: "32px 0 16px" }}>
        Card Styles
      </Title>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="Standard Card">
            <p className="text-gray-300">Standard card content</p>
            <Button variant="primary" className="mt-4">
              Action Button
            </Button>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="No Hover Effect" withHover={false}>
            <p className="text-gray-300">Card with hover effect disabled</p>
            <Button variant="outline" className="mt-4">
              Action Button
            </Button>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            title="Custom Styled Card"
            className="border-blue-800"
            styles={{
              header: {
                background: "linear-gradient(to right, #1e3a8a, #1e40af)",
                borderBottom: "1px solid #2563eb",
                color: "white",
              },
            }}
          >
            <p className="text-gray-300">Card with custom styling</p>
            <Space className="mt-4">
              <Button variant="ghost">Cancel</Button>
              <Button variant="primary">Confirm</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Combination Example */}
      <Title level={3} style={{ color: "#e5e7eb", margin: "32px 0 16px" }}>
        Combination Example
      </Title>

      <Card className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <Space>
            <Tag variant="active" glow>
              ACTIVE BATCH
            </Tag>
            <Text className="text-gray-200">Token Batch #1234</Text>
          </Space>

          <Space>
            <Button variant="ghost" icon={<CloseOutlined />}>
              Cancel
            </Button>
            <Button variant="primary" icon={<CheckOutlined />} animated>
              Confirm
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <div className="text-center">
                <div className="text-5xl text-blue-400 font-semibold mb-2">
                  1.5 ETH
                </div>
                <Text className="text-gray-400">Investment Amount</Text>
              </div>
            </Card>
          </Col>

          <Col span={8}>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <div className="text-center">
                <div className="text-5xl text-green-400 font-semibold mb-2">
                  12%
                </div>
                <Text className="text-gray-400">Annual Yield</Text>
              </div>
            </Card>
          </Col>

          <Col span={8}>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <div className="text-center">
                <div className="text-5xl text-amber-400 font-semibold mb-2">
                  30 days
                </div>
                <Text className="text-gray-400">Lock Period</Text>
              </div>
            </Card>
          </Col>
        </Row>

        <div className="mt-6 flex justify-end">
          <Button variant="gradient" glowing icon={<DollarOutlined />}>
            Invest
          </Button>
        </div>
      </Card>
    </div>
  );
}
