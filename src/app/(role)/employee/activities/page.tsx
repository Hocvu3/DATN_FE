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
import { EmployeeApi } from "@/lib/employee-api";
import type { TableProps } from "antd";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  resource?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: {
      name: string;
    };
    department?: {
      name: string;
    };
  };
}

const EmployeeActivitiesPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await EmployeeApi.getActivities({
        page,
        limit: pageSize,
        action: actionFilter,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
      });

      if (result.data.success && (result.data as any).data) {
        // API returns nested structure: result.data.data.data (array of activities)
        const activitiesData = (result.data as any).data.data || [];
        const pagination = (result.data as any).data.pagination || {};
        setActivities(activitiesData);
        setTotal(pagination.total || 0);
      } else {
        setError(result.data.message || "Failed to fetch activities");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      setError(errorMessage);
      console.error("Fetch activities error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, actionFilter, dateRange]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "green",
      UPDATE: "blue",
      DELETE: "red",
      VIEW: "cyan",
      DOWNLOAD: "purple",
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

  const columns: TableProps<Activity>["columns"] = [
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
      render: (metadata: any, record: Activity) => {
        const details = record.details || metadata;
        
        // Filter out token refresh actions for cleaner display
        if (record.action === 'REFRESH' && record.resource === 'Auth') {
          return <Text type="secondary">Token refreshed</Text>;
        }

        // Handle LOGIN action
        if (record.action === 'LOGIN') {
          const loginTime = new Date(record.createdAt).toLocaleString();
          return (
            <div>
              <Text>Logged in at {loginTime}</Text>
            </div>
          );
        }

        // Handle LOGOUT action
        if (record.action === 'LOGOUT') {
          return <Text>User logged out</Text>;
        }

        // Handle CREATE action
        if (record.action === 'CREATE') {
          if (details?.email) {
            return <Text>Created user: {details.email}</Text>;
          }
          if (details?.title) {
            return <Text>Created document: {details.title}</Text>;
          }
          if (record.resource) {
            return <Text>Created {record.resource}</Text>;
          }
        }

        // Handle UPDATE action
        if (record.action === 'UPDATE') {
          if (details?.changes) {
            const changes = Object.keys(details.changes).filter(
              key => !['accessToken', 'refreshToken', 'password', 'passwordHash'].includes(key)
            );
            if (changes.length > 0) {
              return (
                <div>
                  <Text>Updated fields: {changes.join(', ')}</Text>
                </div>
              );
            }
          }
          if (details?.title) {
            return <Text>Updated document: {details.title}</Text>;
          }
          if (record.resource) {
            return <Text>Updated {record.resource}</Text>;
          }
        }

        // Handle DELETE action
        if (record.action === 'DELETE') {
          if (details?.email) {
            return <Text type="danger">Deleted user: {details.email}</Text>;
          }
          if (details?.title) {
            return <Text type="danger">Deleted document: {details.title}</Text>;
          }
          if (record.resource) {
            return <Text type="danger">Deleted {record.resource}</Text>;
          }
        }

        // Handle VIEW action
        if (record.action === 'VIEW' && details?.title) {
          return <Text>Viewed document: {details.title}</Text>;
        }

        // Handle DOWNLOAD action
        if (record.action === 'DOWNLOAD' && details?.title) {
          return <Text>Downloaded document: {details.title}</Text>;
        }

        // Fallback to document title if available
        if (details?.documentTitle) {
          return <Text>{details.documentTitle}</Text>;
        }

        // Default fallback
        return <Text type="secondary">Entity ID: {record.entityId?.substring(0, 8) || 'N/A'}</Text>;
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
  ];

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <Space>
          <HistoryOutlined />
          My Activities
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

      <Card variant="outlined" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="Search activities..."
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
              <Select.Option value="VIEW">View</Select.Option>
              <Select.Option value="DOWNLOAD">Download</Select.Option>
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
          dataSource={activities}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} activities`,
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

export default EmployeeActivitiesPage;
