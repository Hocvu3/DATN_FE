"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  message,
  Select,
  Typography,
  Statistic,
  Row,
  Col,
  Popconfirm,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SignatureOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { apiGet, apiPut, apiDelete } from "@/lib/api";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Search } = Input;

interface SignatureRequest {
  id: string;
  status: "PENDING" | "SIGNED" | "CANCELLED";
  requestedAt: string;
  signedAt?: string;
  signatureType: string;
  reason?: string;
  documentVersion: {
    id: string;
    versionNumber: number;
    fileSize: number;
    createdAt: string;
    document: {
      id: string;
      title: string;
      documentNumber: string;
    };
  };
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const SignaturesPage = () => {
  const [loading, setLoading] = useState(false);
  const [signRequests, setSignRequests] = useState<SignatureRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SignatureRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [signModalVisible, setSignModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SignatureRequest | null>(null);
  const [form] = Form.useForm();

  // Fetch signature requests
  useEffect(() => {
    fetchSignatureRequests();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = signRequests;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(req => 
        req.documentVersion.document.title.toLowerCase().includes(searchLower) ||
        req.documentVersion.document.documentNumber.toLowerCase().includes(searchLower) ||
        `${req.requester.firstName} ${req.requester.lastName}`.toLowerCase().includes(searchLower)
      );
    }

    setFilteredRequests(filtered);
  }, [statusFilter, searchText, signRequests]);

  const fetchSignatureRequests = async () => {
    try {
      setLoading(true);
      const response = await apiGet<{ 
        success: boolean;
        data: {
          requests: SignatureRequest[];
          total: number;
        };
      }>("/signatures/requests");
      
      const requestsData = response.data?.data?.requests || [];
      setSignRequests(requestsData);
      setFilteredRequests(requestsData);
    } catch (error) {
      message.error({
        content: "Failed to load signature requests",
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
      setSignRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (values: { signatureData: string }) => {
    if (!selectedRequest) return;

    try {
      const response = await apiPut(`/signatures/requests/${selectedRequest.id}/sign`, {
        signatureData: values.signatureData,
      });
      
      message.success({
        content: "Document signed successfully!",
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
      
      setSignModalVisible(false);
      form.resetFields();
      fetchSignatureRequests();
    } catch (error: any) {
      message.error({
        content: error?.response?.data?.message || "Failed to sign document",
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
    }
  };

  const handleRevoke = async (requestId: string) => {
    try {
      const response = await apiPut(`/signatures/requests/${requestId}/revoke`);
      
      message.success({
        content: response.data?.message || "Signature revoked successfully!",
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
      
      fetchSignatureRequests();
    } catch (error: any) {
      message.error({
        content: error?.response?.data?.message || "Failed to revoke signature",
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      PENDING: { color: "orange", icon: <ClockCircleOutlined />, text: "Pending" },
      SIGNED: { color: "green", icon: <CheckCircleOutlined />, text: "Signed" },
      CANCELLED: { color: "default", icon: <CloseCircleOutlined />, text: "Cancelled" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getStats = () => {
    const pending = signRequests.filter(r => r.status === "PENDING").length;
    const signed = signRequests.filter(r => r.status === "SIGNED").length;
    const cancelled = signRequests.filter(r => r.status === "CANCELLED").length;
    
    return { pending, signed, cancelled, total: signRequests.length };
  };

  const stats = getStats();

  const columns = [
    {
      title: "Document",
      dataIndex: ["documentVersion", "document"],
      key: "document",
      render: (doc: any) => (
        <Space direction="vertical" size="small">
          <Text strong>{doc?.title}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {doc?.documentNumber}
          </Text>
        </Space>
      ),
    },
    {
      title: "Version",
      dataIndex: ["documentVersion", "versionNumber"],
      key: "version",
      render: (version: number) => <Tag>v{version}</Tag>,
    },
    {
      title: "Size",
      dataIndex: ["documentVersion", "fileSize"],
      key: "size",
      render: (size: number) => {
        const kb = size / 1024;
        const mb = kb / 1024;
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
      },
    },
    {
      title: "Requested By",
      dataIndex: "requester",
      key: "requester",
      render: (requester: any) => (
        <Space direction="vertical" size="small">
          <Text>{`${requester?.firstName} ${requester?.lastName}`}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {requester?.email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Requested Date",
      dataIndex: "requestedAt",
      key: "requestedAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: SignatureRequest) => (
        <Space>
          {record.status === "PENDING" && (
            <Button
              type="primary"
              size="small"
              icon={<SignatureOutlined />}
              onClick={() => {
                setSelectedRequest(record);
                setSignModalVisible(true);
              }}
            >
              Sign
            </Button>
          )}
          {record.status === "SIGNED" && (
            <>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Signed on {record.signedAt ? new Date(record.signedAt).toLocaleDateString() : 'N/A'}
              </Text>
              <Popconfirm
                title="Revoke Signature"
                description="Are you sure you want to revoke this signature?"
                onConfirm={() => handleRevoke(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  size="small"
                  icon={<UndoOutlined />}
                >
                  Revoke
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <SignatureOutlined /> Digital Sign
        </Title>
        <Text type="secondary">
          Sign documents digitally with secure hash-based signatures
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Requests"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Signed"
              value={stats.signed}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter and Table */}
      <Card title="Documents to Sign">
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="Search by document, number, or requester..."
              allowClear
              style={{ width: 350 }}
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={setSearchText}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              options={[
                { label: "All Status", value: "all" },
                { label: "Pending", value: "PENDING" },
                { label: "Signed", value: "SIGNED" },
                { label: "Cancelled", value: "CANCELLED" },
              ]}
            />
          </Space>
          <Button onClick={fetchSignatureRequests}>Refresh</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} requests`,
          }}
        />
      </Card>

      {/* Sign Modal */}
      <Modal
        title="Sign Document"
        open={signModalVisible}
        onCancel={() => {
          setSignModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <>
            <Space direction="vertical" size="large" style={{ width: "100%", marginBottom: 24 }}>
              <div>
                <Text strong>Document: </Text>
                <Text>{selectedRequest.documentVersion.document.title}</Text>
              </div>
              <div>
                <Text strong>Version: </Text>
                <Tag>v{selectedRequest.documentVersion.versionNumber}</Tag>
              </div>
              <div>
                <Text strong>Document Number: </Text>
                <Text>{selectedRequest.documentVersion.document.documentNumber}</Text>
              </div>
              {selectedRequest.reason && (
                <div>
                  <Text strong>Reason: </Text>
                  <Text>{selectedRequest.reason}</Text>
                </div>
              )}
            </Space>

            <Form form={form} onFinish={handleSign} layout="vertical">
              <Form.Item
                label="Signature Comments (optional)"
                name="signatureData"
              >
                <TextArea
                  rows={4}
                  placeholder="Add any comments about this signature..."
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SignatureOutlined />}>
                    Sign Document
                  </Button>
                  <Button
                    onClick={() => {
                      setSignModalVisible(false);
                      form.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default SignaturesPage;
