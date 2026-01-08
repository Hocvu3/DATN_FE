"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Input,
  Select,
  Table,
  Tag,
  Space,
  Button,
  DatePicker,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Typography,
  App,
  Tooltip,
  Badge,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  ReloadOutlined,
  FilterOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import {
  getAuditLogs,
  getAuditLogStats,
  exportAuditLogs,
  AuditLog,
  AuditLogStats,
} from "@/lib/audit-logs-api";

const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;

const AuditLogPage = () => {
  const { message } = App.useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  
  // Filters
  const [searchText, setSearchText] = useState("");
  const [action, setAction] = useState<string | undefined>(undefined);
  const [resource, setResource] = useState<string | undefined>(undefined);
  const [userType, setUserType] = useState<number>(0);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });



  // Fetch audit logs
  const fetchAuditLogs = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize,
      };

      if (searchText) params.search = searchText;
      if (action) params.action = action;
      if (resource) params.resource = resource;
      if (userType !== 0) params.userType = userType;
      if (dateRange) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }

      const response = await getAuditLogs(params);
      
      // Handle nested response structure: response.data.data.data
      const responseWrapper = response.data as any;
      const responseData = responseWrapper?.data;
      
      if (responseData?.data && Array.isArray(responseData.data)) {
        setLogs(responseData.data);
        
        if (responseData.pagination) {
          setPagination({
            current: responseData.pagination.page || page,
            pageSize: responseData.pagination.limit || pageSize,
            total: responseData.pagination.total || 0,
          });
        }
      } else {
        setLogs([]);
        message.warning("No audit logs found");
      }
    } catch (error: any) {
      console.error("Failed to fetch audit logs:", error);
      setLogs([]);
      message.error(error.message || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit log statistics
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await getAuditLogStats();
      
      // Handle nested structure: response.data.data.data
      const responseWrapper = response.data as any;
      const statsData = responseWrapper?.data;
      
      if (statsData?.data) {
        setStats(statsData.data);
      }
    } catch (error: any) {
      // Don't show error message for stats, it's not critical
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, []);

  // Export logs
  const handleExport = async () => {
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      if (action) params.action = action;
      if (resource) params.resource = resource;
      if (dateRange) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }

      const blob = await exportAuditLogs(params);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `audit-logs-${dayjs().format("YYYY-MM-DD")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success("Audit logs exported successfully");
    } catch (error: any) {
      message.error(error.message || "Failed to export audit logs");
    }
  };

  // View log details
  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalVisible(true);
  };

  // Handle search
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchAuditLogs(1, pagination.pageSize);
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchText("");
    setAction(undefined);
    setResource(undefined);
    setUserType(0);
    setDateRange(null);
    setPagination({ ...pagination, current: 1 });
    fetchAuditLogs(1, pagination.pageSize);
  };

  // Get action color
  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      CREATE: "green",
      READ: "blue",
      UPDATE: "orange",
      DELETE: "red",
      APPROVE: "cyan",
      REJECT: "magenta",
      SIGN: "purple",
      LOGIN: "geekblue",
      LOGOUT: "default",
    };
    return colors[action] || "default";
  };

  // Get resource icon
  const getResourceIcon = (resource: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      documents: <FileTextOutlined />,
      users: <UserOutlined />,
      roles: <SafetyOutlined />,
      departments: <TeamOutlined />,
    };
    return icons[resource.toLowerCase()] || <DatabaseOutlined />;
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss")}>
          <Space direction="vertical" size={0}>
            <Text strong>{dayjs(timestamp).format("MMM DD, YYYY")}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(timestamp).format("HH:mm:ss")}
            </Text>
          </Space>
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (action: string) => (
        <Tag color={getActionColor(action)} style={{ fontWeight: 500 }}>
          {action}
        </Tag>
      ),
      filters: [
        { text: "CREATE", value: "CREATE" },
        { text: "READ", value: "READ" },
        { text: "UPDATE", value: "UPDATE" },
        { text: "DELETE", value: "DELETE" },
        { text: "APPROVE", value: "APPROVE" },
        { text: "REJECT", value: "REJECT" },
        { text: "SIGN", value: "SIGN" },
      ],
    },
    {
      title: "Resource",
      dataIndex: "resource",
      key: "resource",
      width: 150,
      render: (resource: string) => (
        <Space>
          {getResourceIcon(resource)}
          <Text strong>{resource}</Text>
        </Space>
      ),
    },
    {
      title: "Details",
      dataIndex: "resourceId",
      key: "details",
      width: 250,
      render: (resourceId: string, record: any) => {
        // Show document title if available
        if (record.document?.title) {
          return (
            <Space direction="vertical" size={0}>
              <Tooltip title={`Document: ${record.document.title}`}>
                <Text ellipsis style={{ maxWidth: 200 }}>
                  {record.document.title}
                </Text>
              </Tooltip>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.resource}
              </Text>
            </Space>
          );
        }
        
        // Enhanced display based on action and resource
        const { action, resource, details } = record;
        
        if (action === 'LOGIN') {
          return (
            <Space direction="vertical" size={0}>
              <Text>User logged in</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {new Date(record.timestamp).toLocaleTimeString()}
              </Text>
            </Space>
          );
        }
        
        if (action === 'LOGOUT') {
          return <Text type="secondary">User logged out</Text>;
        }
        
        if (action === 'CREATE') {
          const resourceName = resource === 'users' ? 'User' : 
                              resource === 'documents' ? 'Document' : 
                              resource.slice(0, -1);
          return (
            <Space direction="vertical" size={0}>
              <Text>{resourceName} created</Text>
              {details?.new_data?.email && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {details.new_data.email}
                </Text>
              )}
              {details?.new_data?.title && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {details.new_data.title}
                </Text>
              )}
            </Space>
          );
        }
        
        if (action === 'UPDATE') {
          const changedFields = details?.changed_fields;
          if (changedFields && Object.keys(changedFields).length > 0) {
            const meaningfulFields = Object.keys(changedFields).filter(
              key => !['updated_at', 'refresh_token_hash'].includes(key)
            );
            
            if (meaningfulFields.length > 0) {
              return (
                <Space direction="vertical" size={0}>
                  <Text>Updated: {meaningfulFields.join(', ')}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {resource}
                  </Text>
                </Space>
              );
            }
            return <Text type="secondary">Token refresh</Text>;
          }
          return <Text>{resource} updated</Text>;
        }
        
        if (action === 'DELETE') {
          return (
            <Space direction="vertical" size={0}>
              <Text type="danger">{resource.slice(0, -1)} deleted</Text>
              {resourceId && (
                <Tooltip title={resourceId}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    ID: {resourceId.substring(0, 12)}...
                  </Text>
                </Tooltip>
              )}
            </Space>
          );
        }
        
        if (action === 'APPROVE') {
          return <Text style={{ color: '#52c41a' }}>Approved</Text>;
        }
        
        if (action === 'REJECT') {
          return <Text type="danger">Rejected</Text>;
        }
        
        // Fallback
        if (resourceId) {
          return (
            <Tooltip title={resourceId}>
              <Text code copyable={{ text: resourceId }} style={{ fontSize: 12 }}>
                {resourceId.substring(0, 12)}...
              </Text>
            </Tooltip>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 250,
      render: (user: any) => {
        if (!user) {
          return <Text type="secondary">System</Text>;
        }
        return (
          <Space direction="vertical" size={0}>
            <Text strong>
              {user.firstName} {user.lastName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {user.email}
            </Text>
            {user.role && (
              <Space size={4}>
                <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                  {user.role.name}
                </Tag>
                {user.department && (
                  <Tag color="green" style={{ fontSize: 10, margin: 0 }}>
                    {user.department.name}
                  </Tag>
                )}
              </Space>
            )}
          </Space>
        );
      },
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: 140,
      render: (ip: string) => ip ? <Text code>{ip}</Text> : <Text type="secondary">-</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_: any, record: AuditLog) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <SafetyOutlined style={{ marginRight: 12 }} />
          Audit Log Management
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          Track and monitor all system activities and user actions
        </Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Total Logs"
              value={stats?.totalLogs || 0}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Last 24 Hours"
              value={stats?.last24Hours || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Last 7 Days"
              value={stats?.last7Days || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Last 30 Days"
              value={stats?.last30Days || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Input
              placeholder="Search in details..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter by action"
              value={action}
              onChange={setAction}
              allowClear
              style={{ width: "100%" }}
            >
              <Select.Option value="CREATE">CREATE</Select.Option>
              <Select.Option value="READ">READ</Select.Option>
              <Select.Option value="UPDATE">UPDATE</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
              <Select.Option value="APPROVE">APPROVE</Select.Option>
              <Select.Option value="REJECT">REJECT</Select.Option>
              <Select.Option value="SIGN">SIGN</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter by resource"
              value={resource}
              onChange={setResource}
              allowClear
              style={{ width: "100%" }}
            >
              <Select.Option value="documents">Documents</Select.Option>
              <Select.Option value="users">Users</Select.Option>
              <Select.Option value="roles">Roles</Select.Option>
              <Select.Option value="departments">Departments</Select.Option>
              <Select.Option value="signatures">Signatures</Select.Option>
              <Select.Option value="tags">Tags</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={5}>
            <Select
              placeholder="Filter by user type"
              value={userType}
              onChange={setUserType}
              style={{ width: "100%" }}
            >
              <Select.Option value={0}>All Users</Select.Option>
              <Select.Option value={1}>Managers</Select.Option>
              <Select.Option value={2}>Employees</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={7}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Search
            </Button>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </Col>
          <Col>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} logs`,
          }}
          onChange={(newPagination, filters, sorter) => {
            fetchAuditLogs(newPagination.current, newPagination.pageSize);
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Audit Log Details</span>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedLog && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">
              <Text code copyable>
                {selectedLog.id}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Action">
              <Tag color={getActionColor(selectedLog.action)}>
                {selectedLog.action}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Resource">
              <Space>
                {getResourceIcon(selectedLog.resource)}
                <Text strong>{selectedLog.resource}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Resource ID">
              <Text code copyable>
                {selectedLog.resourceId}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="User">
              {selectedLog.user ? (
                <Space direction="vertical" size={0}>
                  <Text strong>
                    {selectedLog.user.firstName} {selectedLog.user.lastName}
                  </Text>
                  <Text type="secondary">{selectedLog.user.email}</Text>
                  <Text code>{selectedLog.user.id}</Text>
                </Space>
              ) : (
                <Text type="secondary">System</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Timestamp">
              {dayjs(selectedLog.timestamp).format("YYYY-MM-DD HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="IP Address">
              {selectedLog.ipAddress ? (
                <Text code>{selectedLog.ipAddress}</Text>
              ) : (
                <Text type="secondary">-</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="User Agent">
              {selectedLog.userAgent ? (
                <Paragraph
                  copyable
                  ellipsis={{ rows: 2, expandable: true }}
                  style={{ margin: 0 }}
                >
                  {selectedLog.userAgent}
                </Paragraph>
              ) : (
                <Text type="secondary">-</Text>
              )}
            </Descriptions.Item>
            {selectedLog.document && (
              <Descriptions.Item label="Related Document">
                <Space direction="vertical" size={0}>
                  <Text strong>{selectedLog.document.title}</Text>
                  <Text code>{selectedLog.document.id}</Text>
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Details">
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: 12,
                  borderRadius: 4,
                  maxHeight: 300,
                  overflow: "auto",
                }}
              >
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogPage;
