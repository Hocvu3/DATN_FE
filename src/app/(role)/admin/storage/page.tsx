"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Alert,
  Tabs,
  Select,
  Switch,
  Space,
  Statistic,
  Progress,
  Avatar,
  Divider,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FolderOpenOutlined,
  CloudServerOutlined,
  SafetyOutlined,
  SettingOutlined,
  UserOutlined,
  EyeOutlined,
  ShareAltOutlined,
  LockOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import Image from "next/image";

// Mock data for storage management
const storageLocations = [
  {
    id: 1,
    name: "Primary Document Storage",
    type: "AWS S3",
    location: "us-east-1",
    capacity: "10 TB",
    used: "6.8 TB",
    usagePercent: 68,
    status: "Active",
    encryption: "AES-256",
    accessLevel: "Private",
    documents: 15420,
    lastSync: "2024-01-20T10:30:00Z",
    costPerMonth: "$450",
  },
  {
    id: 2,
    name: "Archive Storage",
    type: "AWS Glacier",
    location: "us-west-2",
    capacity: "50 TB",
    used: "12.3 TB",
    usagePercent: 25,
    status: "Active",
    encryption: "AES-256",
    accessLevel: "Archive",
    documents: 45200,
    lastSync: "2024-01-19T23:00:00Z",
    costPerMonth: "$89",
  },
  {
    id: 3,
    name: "Backup Storage",
    type: "Local NAS",
    location: "On-Premises",
    capacity: "20 TB",
    used: "14.7 TB",
    usagePercent: 74,
    status: "Active",
    encryption: "BitLocker",
    accessLevel: "Admin Only",
    documents: 8650,
    lastSync: "2024-01-20T06:00:00Z",
    costPerMonth: "$120",
  },
  {
    id: 4,
    name: "Development Storage",
    type: "Google Cloud",
    location: "us-central1",
    capacity: "5 TB",
    used: "2.1 TB",
    usagePercent: 42,
    status: "Active",
    encryption: "Google KMS",
    accessLevel: "Development Team",
    documents: 3240,
    lastSync: "2024-01-20T11:00:00Z",
    costPerMonth: "$180",
  },
];

const recentFiles = [
  {
    id: 1,
    name: "Q4 Financial Report.pdf",
    size: "2.3 MB",
    type: "pdf",
    uploadedBy: "John Admin",
    uploadedAt: "2024-01-20T09:30:00Z",
    location: "Primary Document Storage",
    downloads: 45,
    shares: 12,
  },
  {
    id: 2,
    name: "Employee Handbook 2024.docx",
    size: "5.7 MB",
    type: "docx",
    uploadedBy: "HR Admin",
    uploadedAt: "2024-01-19T14:20:00Z",
    location: "Primary Document Storage",
    downloads: 128,
    shares: 8,
  },
  {
    id: 3,
    name: "Project Timeline.xlsx",
    size: "1.8 MB",
    type: "xlsx",
    uploadedBy: "Project Manager",
    uploadedAt: "2024-01-19T11:15:00Z",
    location: "Primary Document Storage",
    downloads: 67,
    shares: 15,
  },
  {
    id: 4,
    name: "Company Logo Assets.zip",
    size: "15.2 MB",
    type: "zip",
    uploadedBy: "Design Team",
    uploadedAt: "2024-01-18T16:45:00Z",
    location: "Primary Document Storage",
    downloads: 23,
    shares: 5,
  },
];

const storageTypes = ["AWS S3", "AWS Glacier", "Google Cloud", "Azure Blob", "Local NAS"];
const accessLevels = ["Public", "Private", "Admin Only", "Development Team", "Archive"];

const AdminStoragePage = () => {
  const [isStorageModalVisible, setIsStorageModalVisible] = useState(false);
  const [editingStorage, setEditingStorage] = useState<any>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("overview");

  const showStorageModal = (storage: any = null) => {
    setEditingStorage(storage);
    if (storage) {
      form.setFieldsValue({
        name: storage.name,
        type: storage.type,
        location: storage.location,
        capacity: storage.capacity,
        encryption: storage.encryption,
        accessLevel: storage.accessLevel,
      });
    } else {
      form.resetFields();
    }
    setIsStorageModalVisible(true);
  };

  const handleStorageOk = () => {
    form.validateFields().then((values) => {
      console.log("Storage form values:", values);
      form.resetFields();
      setIsStorageModalVisible(false);
    });
  };

  const handleStorageCancel = () => {
    form.resetFields();
    setIsStorageModalVisible(false);
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf": return <FilePdfOutlined className="text-red-500" />;
      case "docx":
      case "doc": return <FileWordOutlined className="text-blue-500" />;
      case "xlsx":
      case "xls": return <FileExcelOutlined className="text-green-500" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif": return <FileImageOutlined className="text-purple-500" />;
      default: return <FileTextOutlined className="text-gray-500" />;
    }
  };

  const getStorageIcon = (type: string) => {
    if (type.includes("AWS")) return <CloudServerOutlined className="text-orange-500" />;
    if (type.includes("Google")) return <CloudServerOutlined className="text-blue-500" />;
    if (type.includes("Azure")) return <CloudServerOutlined className="text-cyan-500" />;
    return <DatabaseOutlined className="text-gray-500" />;
  };

  const storageColumns = [
    {
      title: "Storage Location",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
            {getStorageIcon(record.type)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.type}</div>
            <div className="text-xs text-gray-400">{record.location}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Storage Usage",
      key: "usage",
      render: (_: any, record: any) => (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used:</span>
            <span className="font-medium">{record.used}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total:</span>
            <span className="font-medium">{record.capacity}</span>
          </div>
          <Progress 
            percent={record.usagePercent} 
            size="small"
            status={record.usagePercent > 80 ? "exception" : "active"}
          />
        </div>
      ),
    },
    {
      title: "Security & Access",
      key: "security",
      render: (_: any, record: any) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <LockOutlined className="text-green-500" />
            <span className="text-sm">{record.encryption}</span>
          </div>
          <Tag color="blue">{record.accessLevel}</Tag>
        </div>
      ),
    },
    {
      title: "Documents",
      dataIndex: "documents",
      key: "documents",
      render: (count: number) => (
        <div className="text-center">
          <div className="font-medium text-lg">{count.toLocaleString()}</div>
          <div className="text-xs text-gray-500">documents</div>
        </div>
      ),
    },
    {
      title: "Cost",
      dataIndex: "costPerMonth",
      key: "cost",
      render: (cost: string) => (
        <div className="font-medium text-green-600">{cost}/month</div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Edit Storage">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showStorageModal(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Settings">
            <Button
              type="text"
              icon={<SettingOutlined />}
              className="text-gray-600 hover:text-gray-800"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const fileColumns = [
    {
      title: "File",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <div className="text-xl">
            {getFileIcon(record.type)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.size}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Uploaded By",
      dataIndex: "uploadedBy",
      key: "uploadedBy",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Storage Location",
      dataIndex: "location",
      key: "location",
      render: (location: string) => (
        <Tag color="blue">{location}</Tag>
      ),
    },
    {
      title: "Activity",
      key: "activity",
      render: (_: any, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <DownloadOutlined className="text-blue-500" />
            <span>{record.downloads} downloads</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShareAltOutlined className="text-green-500" />
            <span>{record.shares} shares</span>
          </div>
        </div>
      ),
    },
    {
      title: "Upload Date",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      render: (date: string) => (
        <div className="text-sm">
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const totalCapacity = storageLocations.reduce((acc, storage) => 
    acc + parseFloat(storage.capacity.replace(' TB', '')), 0
  );
  
  const totalUsed = storageLocations.reduce((acc, storage) => 
    acc + parseFloat(storage.used.replace(' TB', '')), 0
  );

  const totalDocuments = storageLocations.reduce((acc, storage) => acc + storage.documents, 0);

  const tabItems = [
    {
      key: "overview",
      label: (
        <span className="flex items-center gap-2">
          <DatabaseOutlined />
          Storage Overview
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Storage Management</h3>
              <p className="text-gray-600">Monitor and manage all storage locations</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showStorageModal()}
              className="bg-blue-600"
            >
              Add Storage
            </Button>
          </div>

          {/* Statistics Cards */}
          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Total Capacity"
                  value={`${totalCapacity} TB`}
                  prefix={<DatabaseOutlined className="text-blue-600" />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Used Storage"
                  value={`${totalUsed.toFixed(1)} TB`}
                  prefix={<DatabaseOutlined className="text-orange-600" />}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Storage Utilization"
                  value={Math.round((totalUsed / totalCapacity) * 100)}
                  suffix="%"
                  prefix={<CloudServerOutlined className="text-green-600" />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Total Documents"
                  value={totalDocuments.toLocaleString()}
                  prefix={<FileTextOutlined className="text-purple-600" />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          <Table
            columns={storageColumns}
            dataSource={storageLocations}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} storage locations`,
            }}
          />
        </div>
      ),
    },
    {
      key: "files",
      label: (
        <span className="flex items-center gap-2">
          <FolderOpenOutlined />
          Recent Files
        </span>
      ),
      children: (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800">Recent File Activity</h3>
            <p className="text-gray-600">Monitor recently uploaded and accessed files</p>
          </div>

          <Table
            columns={fileColumns}
            dataSource={recentFiles}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} files`,
            }}
          />
        </div>
      ),
    },
    {
      key: "analytics",
      label: (
        <span className="flex items-center gap-2">
          <SafetyOutlined />
          Storage Analytics
        </span>
      ),
      children: (
        <div>
          <Alert
            message="Storage Analytics & Insights"
            description="Comprehensive analytics for storage usage, costs, and performance metrics."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <Row gutter={16} className="mb-6">
            <Col xs={24} lg={12}>
              <Card title="Storage Usage by Type" className="h-full">
                <div className="space-y-4">
                  {storageLocations.map((storage) => (
                    <div key={storage.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStorageIcon(storage.type)}
                        <div>
                          <div className="font-medium">{storage.name}</div>
                          <div className="text-sm text-gray-500">{storage.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{storage.used}</div>
                        <div className="text-sm text-gray-500">{storage.usagePercent}% used</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Cost Analysis" className="h-full">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Storage Costs</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${storageLocations.reduce((acc, storage) => 
                        acc + parseInt(storage.costPerMonth.replace('$', '')), 0
                      )}
                    </span>
                  </div>
                  <Divider />
                  {storageLocations.map((storage) => (
                    <div key={storage.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStorageIcon(storage.type)}
                        <span className="text-sm">{storage.name}</span>
                      </div>
                      <span className="font-medium text-green-600">{storage.costPerMonth}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={8}>
              <Card title="Storage Health" className="text-center">
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-green-600">
                    {storageLocations.filter(s => s.status === "Active").length}/
                    {storageLocations.length}
                  </div>
                  <div className="text-gray-600">Active Storage Locations</div>
                  <Progress 
                    type="circle" 
                    percent={Math.round((storageLocations.filter(s => s.status === "Active").length / storageLocations.length) * 100)}
                    size={100}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Security Status" className="text-center">
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-blue-600">100%</div>
                  <div className="text-gray-600">Encrypted Storage</div>
                  <div className="flex items-center justify-center">
                    <LockOutlined className="text-green-500 text-2xl" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Backup Status" className="text-center">
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round((totalUsed / totalCapacity) * 100)}%
                  </div>
                  <div className="text-gray-600">Backup Coverage</div>
                  <div className="flex items-center justify-center">
                    <SafetyOutlined className="text-green-500 text-2xl" />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Storage Management
          </h1>
          <p className="text-gray-600">Manage storage locations, monitor usage, and optimize costs</p>
        </div>
        <div className="flex items-center">
          <Image
            src="/profile-illustration.svg"
            alt="Storage Management"
            width={100}
            height={100}
            className="hidden md:block"
          />
        </div>
      </div>

      <Card className="shadow-md">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Storage Creation/Edit Modal */}
      <Modal
        title={editingStorage ? "Edit Storage Location" : "Add New Storage Location"}
        open={isStorageModalVisible}
        onOk={handleStorageOk}
        onCancel={handleStorageCancel}
        okText={editingStorage ? "Update" : "Add"}
        okButtonProps={{ className: "bg-blue-600" }}
        width={700}
      >
        <Form form={form} layout="vertical" name="storage_form" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Storage Name"
                rules={[{ required: true, message: "Please enter storage name" }]}
              >
                <Input placeholder="Enter storage name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Storage Type"
                rules={[{ required: true, message: "Please select storage type" }]}
              >
                <Select placeholder="Select storage type">
                  {storageTypes.map(type => (
                    <Select.Option key={type} value={type}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location/Region"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input placeholder="e.g., us-east-1, On-Premises" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Storage Capacity"
                rules={[{ required: true, message: "Please enter capacity" }]}
              >
                <Input placeholder="e.g., 10 TB" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="encryption"
                label="Encryption Type"
                rules={[{ required: true, message: "Please select encryption" }]}
              >
                <Select placeholder="Select encryption type">
                  <Select.Option value="AES-256">AES-256</Select.Option>
                  <Select.Option value="BitLocker">BitLocker</Select.Option>
                  <Select.Option value="Google KMS">Google KMS</Select.Option>
                  <Select.Option value="AWS KMS">AWS KMS</Select.Option>
                  <Select.Option value="Azure Key Vault">Azure Key Vault</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="accessLevel"
                label="Access Level"
                rules={[{ required: true, message: "Please select access level" }]}
              >
                <Select placeholder="Select access level">
                  {accessLevels.map(level => (
                    <Select.Option key={level} value={level}>
                      {level}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Configuration Options</Divider>

          <Form.Item
            name="autoBackup"
            label="Automatic Backup"
            valuePropName="checked"
          >
            <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item
            name="versioning"
            label="File Versioning"
            valuePropName="checked"
          >
            <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item
            name="compression"
            label="Data Compression"
            valuePropName="checked"
          >
            <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminStoragePage;