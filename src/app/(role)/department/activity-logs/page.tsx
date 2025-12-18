"use client";

import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Timeline,
  Avatar,
  Tooltip,
  Button,
  Modal,
  Tabs,
  Alert,
} from "antd";
import {
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ShareAltOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

// Mock data for activity logs
const activityLogs = [
  {
    id: 1,
    timestamp: "2024-01-15T10:30:00Z",
    user: "John Doe",
    action: "document_created",
    resource: "Project Proposal.pdf",
    category: "documents",
    details: "Created new document in Engineering department",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0",
    severity: "info",
  },
  {
    id: 2,
    timestamp: "2024-01-15T09:45:00Z",
    user: "Jane Smith",
    action: "member_added",
    resource: "Emily Davis",
    category: "members",
    details: "Added new member to Engineering department",
    ipAddress: "192.168.1.101",
    userAgent: "Firefox 121.0.0",
    severity: "info",
  },
  {
    id: 3,
    timestamp: "2024-01-15T09:20:00Z",
    user: "Robert Johnson",
    action: "document_deleted",
    resource: "Old Design.sketch",
    category: "documents",
    details: "Deleted document permanently",
    ipAddress: "192.168.1.102",
    userAgent: "Safari 17.0.0",
    severity: "warning",
  },
  {
    id: 4,
    timestamp: "2024-01-15T08:15:00Z",
    user: "Emily Davis",
    action: "permission_changed",
    resource: "Senior Member Role",
    category: "permissions",
    details: "Modified role permissions for document approval",
    ipAddress: "192.168.1.103",
    userAgent: "Chrome 120.0.0",
    severity: "high",
  },
  {
    id: 5,
    timestamp: "2024-01-15T07:30:00Z",
    user: "Michael Wilson",
    action: "document_shared",
    resource: "API Documentation.md",
    category: "documents",
    details: "Shared document with external partner",
    ipAddress: "192.168.1.104",
    userAgent: "Edge 120.0.0",
    severity: "info",
  },
  {
    id: 6,
    timestamp: "2024-01-14T16:45:00Z",
    user: "Sarah Brown",
    action: "department_settings_updated",
    resource: "Engineering Department",
    category: "settings",
    details: "Updated department workflow settings",
    ipAddress: "192.168.1.105",
    userAgent: "Chrome 120.0.0",
    severity: "medium",
  },
];

const actionTypes = [
  "document_created",
  "document_edited",
  "document_deleted",
  "document_shared",
  "member_added",
  "member_removed",
  "permission_changed",
  "department_settings_updated",
];

const categories = ["documents", "members", "permissions", "settings"];
const severityLevels = ["info", "medium", "warning", "high"];

const DepartmentActivityLogsPage = () => {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("table");

  const showDetail = (log: any) => {
    setSelectedLog(log);
    setIsDetailModalVisible(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "info": return "blue";
      case "medium": return "orange";
      case "warning": return "red";
      case "high": return "purple";
      default: return "gray";
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("document")) {
      if (action.includes("created")) return <PlusOutlined />;
      if (action.includes("edited")) return <EditOutlined />;
      if (action.includes("deleted")) return <DeleteOutlined />;
      if (action.includes("shared")) return <ShareAltOutlined />;
      return <FileTextOutlined />;
    }
    if (action.includes("member")) return <UserOutlined />;
    if (action.includes("permission")) return action.includes("granted") ? <UnlockOutlined /> : <LockOutlined />;
    if (action.includes("settings")) return <SettingOutlined />;
    return <ClockCircleOutlined />;
  };

  const formatAction = (action: string) => {
    return action.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const columns = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      sorter: (a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      render: (timestamp: string) => (
        <div>
          <div className="font-medium">
            {dayjs(timestamp).format("MMM DD, YYYY")}
          </div>
          <div className="text-sm text-gray-500">
            {dayjs(timestamp).format("HH:mm:ss")}
          </div>
        </div>
      ),
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user: string) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{user}</span>
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      filters: actionTypes.map(action => ({ text: formatAction(action), value: action })),
      onFilter: (value: any, record: any) => record.action === value,
      render: (action: string) => (
        <div className="flex items-center gap-2">
          {getActionIcon(action)}
          <span>{formatAction(action)}</span>
        </div>
      ),
    },
    {
      title: "Resource",
      dataIndex: "resource",
      key: "resource",
      ellipsis: true,
      render: (resource: string) => (
        <Tooltip title={resource}>
          <span className="text-blue-600">{resource}</span>
        </Tooltip>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      filters: categories.map(cat => ({ text: cat.charAt(0).toUpperCase() + cat.slice(1), value: cat })),
      onFilter: (value: any, record: any) => record.category === value,
      render: (category: string) => {
        let color = "blue";
        if (category === "documents") color = "green";
        if (category === "members") color = "orange";
        if (category === "permissions") color = "red";
        if (category === "settings") color = "purple";
        
        return <Tag color={color}>{category}</Tag>;
      },
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      filters: severityLevels.map(level => ({ text: level.charAt(0).toUpperCase() + level.slice(1), value: level })),
      onFilter: (value: any, record: any) => record.severity === value,
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
          className="text-blue-600 hover:text-blue-800"
        >
          View Details
        </Button>
      ),
    },
  ];

  const todayCount = activityLogs.filter(log => 
    dayjs(log.timestamp).isSame(dayjs(), 'day')
  ).length;

  const highSeverityCount = activityLogs.filter(log => 
    ['warning', 'high'].includes(log.severity)
  ).length;

  const tabItems = [
    {
      key: "table",
      label: (
        <span className="flex items-center gap-2">
          <ClockCircleOutlined />
          Activity Table
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between mb-4 flex-col lg:flex-row gap-4">
            <div className="flex gap-2 flex-1 max-w-2xl">
              <Input
                placeholder="Search activities..."
                prefix={<SearchOutlined className="text-gray-400" />}
                className="flex-1"
              />
              <Select
                placeholder="Category"
                style={{ width: 120 }}
                allowClear
              >
                {categories.map(cat => (
                  <Select.Option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Select.Option>
                ))}
              </Select>
              <RangePicker className="hidden md:block" />
            </div>
            <Button
              icon={<DownloadOutlined />}
              className="bg-white border-gray-200"
            >
              Export
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={activityLogs}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} activities`,
            }}
          />
        </div>
      ),
    },
    {
      key: "timeline",
      label: (
        <span className="flex items-center gap-2">
          <TeamOutlined />
          Activity Timeline
        </span>
      ),
      children: (
        <div>
          <Alert
            message="Real-time Activity Feed"
            description="Monitor all department activities in chronological order."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <Timeline
            mode="left"
            items={activityLogs.map(log => ({
              dot: React.createElement(
                Avatar,
                { 
                  size: "small", 
                  icon: getActionIcon(log.action),
                  style: { backgroundColor: getSeverityColor(log.severity) }
                }
              ),
              children: (
                <div className="ml-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.user}</span>
                      <span className="text-gray-500">
                        {formatAction(log.action).toLowerCase()}
                      </span>
                      <span className="text-blue-600 font-medium">{log.resource}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {dayjs(log.timestamp).format("HH:mm")}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{log.details}</p>
                  <div className="flex gap-2">
                    <Tag color={getSeverityColor(log.severity)}>
                      {log.severity}
                    </Tag>
                    <Tag color="blue">
                      {log.category}
                    </Tag>
                  </div>
                </div>
              ),
            }))}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: "#262626", marginBottom: 8 }}>
            Department Activity Logs
          </h1>
          <p style={{ color: "#8c8c8c" }}>Monitor and audit all department activities</p>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/departments-illustration.svg"
            alt="Activity Logs"
            width={100}
            height={100}
            style={{ display: "none" }}
            className="md:block"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Statistic
              title="Total Activities"
              value={activityLogs.length}
              prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Statistic
              title="Today's Activities"
              value={todayCount}
              prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Statistic
              title="High Priority"
              value={highSeverityCount}
              prefix={<FilterOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <Modal
        title="Activity Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedLog && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-500">Timestamp</label>
                  <div className="text-gray-900">
                    {dayjs(selectedLog.timestamp).format("MMMM DD, YYYY HH:mm:ss")}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-500">User</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Avatar size="small" icon={<UserOutlined />} />
                    {selectedLog.user}
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-500">Action</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    {getActionIcon(selectedLog.action)}
                    {formatAction(selectedLog.action)}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <label className="text-sm font-medium text-gray-500">Resource</label>
                  <div className="text-blue-600 font-medium">{selectedLog.resource}</div>
                </div>
              </Col>
            </Row>

            <div>
              <label className="text-sm font-medium text-gray-500">Details</label>
              <div className="text-gray-900">{selectedLog.details}</div>
            </div>

            <Row gutter={16}>
              <Col span={8}>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div>
                    <Tag color="blue">{selectedLog.category}</Tag>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <label className="text-sm font-medium text-gray-500">Severity</label>
                  <div>
                    <Tag color={getSeverityColor(selectedLog.severity)}>
                      {selectedLog.severity.toUpperCase()}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div>
                  <label className="text-sm font-medium text-gray-500">IP Address</label>
                  <div className="text-gray-900 font-mono text-sm">
                    {selectedLog.ipAddress}
                  </div>
                </div>
              </Col>
            </Row>

            <div>
              <label className="text-sm font-medium text-gray-500">User Agent</label>
              <div className="text-gray-900 font-mono text-sm">{selectedLog.userAgent}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DepartmentActivityLogsPage;