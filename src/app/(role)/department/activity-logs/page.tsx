"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Input,
  Tag,
  Space,
  Avatar,
  Typography,
  Spin,
  Alert,
  DatePicker,
  Select,
} from "antd";
import {
  SearchOutlined,
  HistoryOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { DepartmentApi } from "@/lib/department-api";
import type { TableProps } from "antd";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  resource?: string;
  details?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: {
      id: string;
      name: string;
    };
    department?: {
      id: string;
      name: string;
    };
  };
  document?: {
    id: string;
    title: string;
  };
}

const ActivityLogsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
  const [userType, setUserType] = useState<number>(0);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await DepartmentApi.getActivityLogs({
        page,
        limit: pageSize,
        action: actionFilter,
        userType: userType !== 0 ? userType : undefined,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
      });

      if (result.data.success && result.data.data) {
        // Backend returns { data: [], pagination: {} }
        // result.data.data is that object
        // So logs are in result.data.data.data
        const backendData = result.data.data;
        // Check if 'data' property exists and is array (standard audit log response)
        // or fall back to 'logs' if that was used before
        const logsData = (backendData as any).data || (backendData as any).logs || [];

        setLogs(logsData);
        setTotal(backendData.pagination?.total || (backendData as any).total || 0);
      } else {
        setError(result.data.message || "Failed to fetch activity logs");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      setError(errorMessage);
      console.error("Fetch logs error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, actionFilter, userType, dateRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "green",
      UPDATE: "blue",
      DELETE: "red",
      APPROVE: "cyan",
      REJECT: "orange",
      LOGIN: "purple",
      LOGOUT: "default",
    };
    return colors[action] || "default";
  };

  const getEntityIcon = (entityType: string) => {
    const icons: Record<string, React.ReactNode> = {
      DOCUMENT: <FileTextOutlined />,
      USER: <UserOutlined />,
    };
    return icons[entityType] || <FileTextOutlined />;
  };

  const columns: TableProps<ActivityLog>["columns"] = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      width: 250,
      render: (user: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
          <div>
            <div><Text strong>{user.firstName} {user.lastName}</Text></div>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{user.email}</Text></div>
            {user.role && (
              <Space size={4} style={{ marginTop: 4 }}>
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
          </div>
        </Space>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action}</Tag>
      ),
    },
    {
      title: "Entity",
      dataIndex: "entityType",
      key: "entityType",
      width: 120,
      render: (entityType: string) => (
        <Space>
          {getEntityIcon(entityType)}
          <Text>{entityType}</Text>
        </Space>
      ),
    },
    {
      title: "Details",
      dataIndex: "metadata",
      key: "metadata",
      width: 250,
      render: (metadata: any, record: ActivityLog) => {
        // Show document title if available
        if (record.document?.title) {
          return (
            <Space direction="vertical" size={0}>
              <Text strong>{record.document.title}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.resource}
              </Text>
            </Space>
          );
        }
        
        // For metadata with documentTitle
        if (metadata?.documentTitle) {
          return <Text>{metadata.documentTitle}</Text>;
        }
        
        // Enhanced display based on action and resource
        const { action, resource, details } = record;
        
        if (action === 'LOGIN') {
          return (
            <Space direction="vertical" size={0}>
              <Text>User logged in</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {new Date(record.createdAt).toLocaleTimeString()}
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
                              (resource ? resource.slice(0, -1) : 'Resource');
          return (
            <Space direction="vertical" size={0}>
              <Text>{resourceName} created</Text>
              {details?.new_data?.email && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {details.new_data.email}
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
              <Text type="danger">{resource ? resource.slice(0, -1) : 'Resource'} deleted</Text>
              {record.entityId && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  ID: {record.entityId.substring(0, 12)}...
                </Text>
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
        if (record.entityId) {
          return <Text type="secondary">Entity ID: {record.entityId.substring(0, 12)}...</Text>;
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: true,
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString()}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(date).toLocaleTimeString()}
          </Text>
        </div>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: 120,
      render: (ip: string) => <Text type="secondary">{ip || "N/A"}</Text>,
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <Space>
          <HistoryOutlined />
          Activity Logs
        </Space>
      </Title>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="Search logs..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Filter by action"
              allowClear
              value={actionFilter}
              onChange={setActionFilter}
              style={{ width: 150 }}
            >
              <Select.Option value="CREATE">Create</Select.Option>
              <Select.Option value="UPDATE">Update</Select.Option>
              <Select.Option value="DELETE">Delete</Select.Option>
              <Select.Option value="APPROVE">Approve</Select.Option>
              <Select.Option value="REJECT">Reject</Select.Option>
            </Select>
            <Select
              placeholder="Filter by user type"
              value={userType}
              onChange={setUserType}
              style={{ width: 150 }}
            >
              <Select.Option value={0}>All Users</Select.Option>
              <Select.Option value={1}>Managers</Select.Option>
              <Select.Option value={2}>Employees</Select.Option>
            </Select>
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setDateRange([
                    dates[0]?.format("YYYY-MM-DD") || "",
                    dates[1]?.format("YYYY-MM-DD") || "",
                  ]);
                } else {
                  setDateRange(null);
                }
              }}
            />
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} logs`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default ActivityLogsPage;
