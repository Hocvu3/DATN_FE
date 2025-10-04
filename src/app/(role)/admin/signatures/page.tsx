"use client";

import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  message,
  Table,
  Tag,
  Space,
  Tooltip,
  Select,
  Badge,
  Tabs,
  List,
  Progress,
  Dropdown,
  MenuProps,
  Typography,
  Statistic,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface Signature {
  id: string;
  name: string;
  type: "electronic" | "digital";
  status: "active" | "expired" | "revoked";
  created: string;
  expiryDate?: string;
  documents: number;
  lastUsed?: string;
  certificate?: string;
  description?: string;
  owner: string;
  department: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  created: string;
  size: string;
  signatureProgress: number;
  signedBy: number;
  totalSigners: number;
}

const SignaturesPage = () => {
  // State management
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isSignModalVisible, setIsSignModalVisible] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(null);
  const [activeTab, setActiveTab] = useState("signatures");
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Mock data for signatures
  const [signatures, setSignatures] = useState<Signature[]>([
    {
      id: "1",
      name: "CEO Digital Signature",
      type: "digital",
      status: "active",
      created: "2024-08-15",
      expiryDate: "2025-08-15",
      documents: 45,
      lastUsed: "2024-09-28",
      certificate: "SHA-256 RSA",
      description: "Primary executive signature for high-level documents",
      owner: "John Smith",
      department: "Executive",
    },
    {
      id: "2", 
      name: "HR Department Seal",
      type: "electronic",
      status: "active",
      created: "2024-09-01",
      documents: 128,
      lastUsed: "2024-09-30",
      description: "Official HR department signature for employment documents",
      owner: "Sarah Johnson",
      department: "Human Resources",
    },
    {
      id: "3",
      name: "Financial Officer Signature",
      type: "digital",
      status: "active", 
      created: "2024-09-10",
      expiryDate: "2025-09-10",
      documents: 89,
      lastUsed: "2024-09-29",
      certificate: "SHA-256 ECDSA",
      description: "Financial documents and contracts signature",
      owner: "Michael Chen",
      department: "Finance",
    },
    {
      id: "4",
      name: "Expired Legal Signature",
      type: "digital",
      status: "expired",
      created: "2023-06-01",
      expiryDate: "2024-06-01",
      documents: 23,
      lastUsed: "2024-05-30",
      certificate: "SHA-256 RSA",
      description: "Former legal department signature (expired)",
      owner: "Emily Davis",
      department: "Legal",
    },
  ]);

  // Mock data for documents to sign
  const documentsToSign: Document[] = [
    {
      id: "1",
      name: "Employment Contract - Alice Johnson",
      type: "PDF",
      status: "pending",
      created: "2024-01-15",
      size: "2.3 MB",
      signatureProgress: 0,
      signedBy: 0,
      totalSigners: 2,
    },
    {
      id: "2",
      name: "Q4 Financial Report",
      type: "PDF",
      status: "partial",
      created: "2024-01-20",
      size: "5.7 MB",
      signatureProgress: 50,
      signedBy: 1,
      totalSigners: 2,
    },
    {
      id: "3",
      name: "Partnership Agreement",
      type: "DOCX",
      status: "complete",
      created: "2024-01-18",
      size: "1.8 MB",
      signatureProgress: 100,
      signedBy: 2,
      totalSigners: 2,
    },
    {
      id: "4",
      name: "Vendor Contract - TechCorp",
      type: "PDF",
      status: "pending",
      created: "2024-01-22",
      size: "3.2 MB",
      signatureProgress: 0,
      signedBy: 0,
      totalSigners: 3,
    },
  ];  // Handler functions
  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const showEditModal = (signature: Signature) => {
    setSelectedSignature(signature);
    editForm.setFieldsValue(signature);
    setIsEditModalVisible(true);
  };

  const showDetailsModal = (signature: Signature) => {
    setSelectedSignature(signature);
    setIsDetailsModalVisible(true);
  };

  const showSignModal = () => {
    setIsSignModalVisible(true);
  };

  const handleCreateCancel = () => {
    setIsCreateModalVisible(false);
    form.resetFields();
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
    setSelectedSignature(null);
  };

  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setSelectedSignature(null);
  };

  const handleSignCancel = () => {
    setIsSignModalVisible(false);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const newSignature: Signature = {
        id: String(signatures.length + 1),
        ...values,
        status: "active",
        created: new Date().toISOString().split('T')[0],
        documents: 0,
        owner: "Current User", // In real app, get from auth context
        department: "Admin", // In real app, get from user context
      };
      
      setSignatures([...signatures, newSignature]);
      message.success("Digital signature created successfully!");
      handleCreateCancel();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      const updatedSignatures = signatures.map(sig => 
        sig.id === selectedSignature?.id 
          ? { ...sig, ...values }
          : sig
      );
      
      setSignatures(updatedSignatures);
      message.success("Digital signature updated successfully!");
      handleEditCancel();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleDelete = (signatureId: string) => {
    const updatedSignatures = signatures.filter(sig => sig.id !== signatureId);
    setSignatures(updatedSignatures);
    message.success("Digital signature deleted successfully!");
  };

  const handleSignDocument = () => {
    // In real app, this would call API to sign the document
    message.success("Document signed successfully!");
    setIsSignModalVisible(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "green";
      case "expired": return "red";
      case "revoked": return "orange";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircleOutlined />;
      case "expired": return <ExclamationCircleOutlined />;
      case "revoked": return <ClockCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const signatureColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Space>
          <EditOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "digital" ? "blue" : "green"}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge 
          status={status === "active" ? "success" : "error"} 
          text={
            <Space>
              {getStatusIcon(status)}
              <Text style={{ color: status === "active" ? "#52c41a" : "#ff4d4f" }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </Space>
          }
        />
      ),
    },
    {
      title: "Documents Signed",
      dataIndex: "documents",
      key: "documents",
      render: (count: number) => (
        <Tag color="blue">{count}</Tag>
      ),
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (dept: string) => (
        <Tag color="purple">{dept}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
    },
    {
      title: "Expires",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date: string) => {
        const isExpired = new Date(date) < new Date();
        return (
          <Text type={isExpired ? "danger" : "secondary"}>
            {date}
          </Text>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Signature) => {
        const dropdownItems: MenuProps['items'] = [
          {
            key: "edit",
            label: "Edit",
            icon: <EditOutlined />,
            onClick: () => showEditModal(record),
          },
          {
            key: "details",
            label: "View Details",
            icon: <EyeOutlined />,
            onClick: () => showDetailsModal(record),
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: "Delete Signature",
                content: `Are you sure you want to delete "${record.name}"?`,
                okText: "Delete",
                okType: "danger",
                onOk: () => handleDelete(record.id),
              });
            },
          },
        ];

        return (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => showDetailsModal(record)}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => showEditModal(record)}
              />
            </Tooltip>
            <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Digital Signatures
              </h1>
              <Text type="secondary">
                Manage digital signatures and sign documents securely
              </Text>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={showSignModal}
                size="large"
              >
                Sign Document
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showCreateModal}
                size="large"
              >
                Create Signature
              </Button>
            </Space>
          </div>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Signatures"
                value={signatures.length}
                prefix={<EditOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Signatures"
                value={signatures.filter(s => s.status === "active").length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Documents Signed"
                value={signatures.reduce((sum, s) => sum + s.documents, 0)}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Expiring Soon"
                value={signatures.filter(s => {
                  if (!s.expiryDate) return false;
                  const expiryDate = new Date(s.expiryDate);
                  const thirtyDaysFromNow = new Date();
                  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                  return expiryDate <= thirtyDaysFromNow && s.status === "active";
                }).length}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card className="shadow-sm">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "signatures",
                label: (
                  <Space>
                    <EditOutlined />
                    Signatures
                  </Space>
                ),
                children: (
                  <Table
                    columns={signatureColumns}
                    dataSource={signatures}
                    rowKey="id"
                    pagination={{
                      total: signatures.length,
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} signatures`,
                    }}
                    scroll={{ x: 1200 }}
                  />
                ),
              },
              {
                key: "documents",
                label: (
                  <Space>
                    <FileTextOutlined />
                    Documents to Sign
                  </Space>
                ),
                children: (
                  <List
                    dataSource={documentsToSign}
                    renderItem={(doc) => (
                      <List.Item
                        actions={[
                          <Button
                            key="sign"
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={showSignModal}
                          >
                            Sign
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<FileTextOutlined style={{ fontSize: 24 }} />}
                          title={
                            <Space>
                              <Text strong>{doc.name}</Text>
                              <Tag color={getStatusColor(doc.status)}>
                                {doc.status.toUpperCase()}
                              </Tag>
                            </Space>
                          }
                          description={
                            <div>
                              <Text type="secondary">{doc.type}</Text>
                              <br />
                              <Space>
                                <Text type="secondary">
                                  Created: {doc.created}
                                </Text>
                                <Text type="secondary">
                                  Size: {doc.size}
                                </Text>
                              </Space>
                              {doc.signatureProgress > 0 && (
                                <div className="mt-2">
                                  <Progress
                                    percent={doc.signatureProgress}
                                    size="small"
                                    status={doc.signatureProgress === 100 ? "success" : "active"}
                                  />
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {doc.signedBy} / {doc.totalSigners} signatures
                                  </Text>
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* Create Signature Modal */}
        <Modal
          title={
            <Space>
              <PlusOutlined />
              Create New Digital Signature
            </Space>
          }
          open={isCreateModalVisible}
          onOk={handleCreate}
          onCancel={handleCreateCancel}
          width={600}
          destroyOnHidden
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              name="name"
              label="Signature Name"
              rules={[
                { required: true, message: "Please enter signature name!" },
              ]}
            >
              <Input
                prefix={<EditOutlined />}
                placeholder="Enter signature name"
              />
            </Form.Item>
            
            <Form.Item
              name="type"
              label="Signature Type"
              rules={[
                { required: true, message: "Please select signature type!" },
              ]}
            >
              <Select placeholder="Select signature type">
                <Select.Option value="digital">Digital</Select.Option>
                <Select.Option value="electronic">Electronic</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="certificate"
              label="Certificate"
              rules={[
                { required: true, message: "Please enter certificate!" },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter certificate information"
              />
            </Form.Item>

            <Form.Item
              name="expiryDate"
              label="Expiry Date"
              rules={[
                { required: true, message: "Please select expiry date!" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={3}
                placeholder="Enter description (optional)"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Edit Signature Modal */}
        <Modal
          title={
            <Space>
              <EditOutlined />
              Edit Digital Signature
            </Space>
          }
          open={isEditModalVisible}
          onOk={handleEdit}
          onCancel={handleEditCancel}
          width={600}
          destroyOnHidden
        >
          <Form form={editForm} layout="vertical" className="mt-4">
            <Form.Item
              name="name"
              label="Signature Name"
              rules={[
                { required: true, message: "Please enter signature name!" },
              ]}
            >
              <Input
                prefix={<EditOutlined />}
                placeholder="Enter signature name"
              />
            </Form.Item>
            
            <Form.Item
              name="type"
              label="Signature Type"
              rules={[
                { required: true, message: "Please select signature type!" },
              ]}
            >
              <Select placeholder="Select signature type">
                <Select.Option value="digital">Digital</Select.Option>
                <Select.Option value="electronic">Electronic</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="certificate"
              label="Certificate"
              rules={[
                { required: true, message: "Please enter certificate!" },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter certificate information"
              />
            </Form.Item>

            <Form.Item
              name="expiryDate"
              label="Expiry Date"
              rules={[
                { required: true, message: "Please select expiry date!" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea
                rows={3}
                placeholder="Enter description (optional)"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Signature Details Modal */}
        <Modal
          title={
            <Space>
              <EyeOutlined />
              Signature Details
            </Space>
          }
          open={isDetailsModalVisible}
          onCancel={handleDetailsCancel}
          footer={[
            <Button key="close" onClick={handleDetailsCancel}>
              Close
            </Button>,
          ]}
          width={700}
          destroyOnHidden
        >
          {selectedSignature && (
            <div className="space-y-6">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Name</Text>
                    <div className="font-medium">{selectedSignature.name}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Type</Text>
                    <div>
                      <Tag color={selectedSignature.type === "digital" ? "blue" : "green"}>
                        {selectedSignature.type.toUpperCase()}
                      </Tag>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Status</Text>
                    <div>
                      <Badge 
                        status={selectedSignature.status === "active" ? "success" : "error"} 
                        text={selectedSignature.status.charAt(0).toUpperCase() + selectedSignature.status.slice(1)}
                      />
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Documents Signed</Text>
                    <div className="font-medium">{selectedSignature.documents}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Owner</Text>
                    <div className="font-medium">{selectedSignature.owner}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Department</Text>
                    <div>
                      <Tag color="purple">{selectedSignature.department}</Tag>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Created</Text>
                    <div className="font-medium">{selectedSignature.created}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Expires</Text>
                    <div className="font-medium">{selectedSignature.expiryDate}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text type="secondary">Last Used</Text>
                    <div className="font-medium">{selectedSignature.lastUsed}</div>
                  </div>
                </Col>
              </Row>
              
              {selectedSignature.certificate && (
                <div>
                  <Text type="secondary">Certificate</Text>
                  <div className="bg-gray-50 p-3 rounded mt-1">
                    <Text code>{selectedSignature.certificate}</Text>
                  </div>
                </div>
              )}
              
              {selectedSignature.description && (
                <div>
                  <Text type="secondary">Description</Text>
                  <div className="mt-1">{selectedSignature.description}</div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Sign Document Modal */}
        <Modal
          title={
            <Space>
              <EditOutlined />
              Sign Document
            </Space>
          }
          open={isSignModalVisible}
          onCancel={handleSignCancel}
          footer={[
            <Button key="cancel" onClick={handleSignCancel}>
              Cancel
            </Button>,
            <Button
              key="sign"
              type="primary"
              icon={<EditOutlined />}
              onClick={handleSignDocument}
            >
              Sign Document
            </Button>,
          ]}
          width={800}
          destroyOnHidden
        >
          <div className="space-y-6">
            <div>
              <Text strong>Select Document to Sign:</Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="Choose document"
                size="large"
              >
                {documentsToSign.map(doc => (
                  <Select.Option key={doc.id} value={doc.id}>
                    <Space>
                      <FileTextOutlined />
                      {doc.name}
                      <Tag color={getStatusColor(doc.status)}>
                        {doc.status.toUpperCase()}
                      </Tag>
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </div>
            
            <div>
              <Text strong>Select Signature:</Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="Choose signature"
                size="large"
              >
                {signatures.filter(s => s.status === "active").map(sig => (
                  <Select.Option key={sig.id} value={sig.id}>
                    <Space>
                      <EditOutlined />
                      {sig.name}
                      <Tag color="blue">{sig.type.toUpperCase()}</Tag>
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SignaturesPage;
