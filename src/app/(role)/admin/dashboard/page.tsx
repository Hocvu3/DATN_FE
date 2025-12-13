"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  message,
  Spin,
  Avatar,
  Typography,
  Progress,
  Tooltip,
} from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileProtectOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { apiGet } from "@/lib/api";
import dynamic from "next/dynamic";

// Dynamic import for charts to avoid SSR issues
const Column = dynamic(
  () => import("@ant-design/charts").then((mod) => mod.Column),
  { ssr: false }
);
const Pie = dynamic(
  () => import("@ant-design/charts").then((mod) => mod.Pie),
  { ssr: false }
);

const { Title, Text } = Typography;

interface DashboardStats {
  overview: {
    totalDocuments: number;
    totalUsers: number;
    totalDepartments: number;
    pendingApprovals: number;
    documentsThisMonth: number;
    growthPercentage: number;
  };
  documentsByStatus: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  documentsPerDay: Array<{
    date: string;
    dayName: string;
    count: number;
  }>;
  departmentStats: Array<{
    id: string;
    name: string;
    documentCount: number;
  }>;
  recentDocuments: Array<{
    id: string;
    title: string;
    documentNumber: string;
    status: string;
    createdAt: string;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    department: {
      id: string;
      name: string;
    };
  }>;
}

export default function AdminDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats only
      const statsResponse = await apiGet<any>("/documents/dashboard-stats");
      const statsData = statsResponse.data?.data || statsResponse.data;
      setStats(statsData);

      // Skip signature requests and stamps - can cause 500 errors if endpoints not ready
      // These can be added later when backend APIs are stable
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      messageApi.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "default",
      PENDING_APPROVAL: "orange",
      APPROVED: "green",
      REJECTED: "red",
      ARCHIVED: "purple",
      PENDING: "orange",
      SIGNED: "green",
      EXPIRED: "red",
      REVOKED: "volcano",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      DRAFT: "Draft",
      PENDING_APPROVAL: "Pending",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      ARCHIVED: "Archived",
      PENDING: "Pending",
      SIGNED: "Signed",
      EXPIRED: "Expired",
      REVOKED: "Revoked",
    };
    return texts[status] || status;
  };

  // Chart configurations - Orange theme
  const columnConfig = {
    data: stats?.documentsPerDay || [],
    xField: "dayName",
    yField: "count",
    color: "#f97316", // Orange color to match theme
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: "top" as const,
      style: {
        fill: "#666",
        fontSize: 12,
        fontWeight: 500,
      },
    },
    xAxis: {
      label: {
        style: {
          fontSize: 12,
          fill: "#666",
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fontSize: 12,
          fill: "#666",
        },
      },
    },
    meta: {
      count: { alias: "Documents" },
    },
  };

  const pieConfig = {
    data: stats?.documentsByStatus || [],
    angleField: "count",
    colorField: "status",
    radius: 0.8,
    innerRadius: 0.6,
    color: stats?.documentsByStatus?.map((d) => d.color) || [],
    label: {
      type: "outer",
      content: "{name}: {value}",
    },
    legend: {
      position: "bottom" as const,
    },
    statistic: {
      title: {
        content: "Total",
        style: { fontSize: "14px" },
      },
      content: {
        content: String(stats?.overview?.totalDocuments || 0),
        style: { fontSize: "24px", fontWeight: "bold" },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {contextHolder}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} style={{ margin: 0, color: "#1a1a2e" }}>
            Admin Dashboard
          </Title>
          <Text type="secondary">
            Welcome back! Here&apos;s what&apos;s happening with your documents.
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchDashboardData}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Clean pastel theme */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="hover:shadow-lg transition-shadow duration-300"
            style={{
              background: "#fff7ed", // Orange-50 pastel
              border: "1px solid #fed7aa", // Orange-200 border
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text style={{ color: "#9a3412", fontSize: 14, fontWeight: 500 }}>
                  Total Documents
                </Text>
                <Title level={2} style={{ color: "#ea580c", margin: "8px 0 0 0" }}>
                  {stats?.overview?.totalDocuments || 0}
                </Title>
                <div className="flex items-center mt-2">
                  {(stats?.overview?.growthPercentage || 0) >= 0 ? (
                    <RiseOutlined style={{ color: "#16a34a" }} />
                  ) : (
                    <FallOutlined style={{ color: "#dc2626" }} />
                  )}
                  <Text
                    style={{
                      color:
                        (stats?.overview?.growthPercentage || 0) >= 0
                          ? "#16a34a"
                          : "#dc2626",
                      marginLeft: 4,
                      fontSize: 12,
                    }}
                  >
                    {Math.abs(stats?.overview?.growthPercentage || 0)}% this month
                  </Text>
                </div>
              </div>
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 60,
                  height: 60,
                  background: "#fed7aa", // Orange-200
                }}
              >
                <FileTextOutlined style={{ fontSize: 28, color: "#ea580c" }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="hover:shadow-lg transition-shadow duration-300"
            style={{
              background: "#ecfdf5", // Emerald-50 pastel
              border: "1px solid #a7f3d0", // Emerald-200 border
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text style={{ color: "#065f46", fontSize: 14, fontWeight: 500 }}>
                  Total Users
                </Text>
                <Title level={2} style={{ color: "#059669", margin: "8px 0 0 0" }}>
                  {stats?.overview?.totalUsers || 0}
                </Title>
                <Text
                  style={{ color: "#047857", fontSize: 12 }}
                >
                  Active across {stats?.overview?.totalDepartments || 0} departments
                </Text>
              </div>
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 60,
                  height: 60,
                  background: "#a7f3d0", // Emerald-200
                }}
              >
                <TeamOutlined style={{ fontSize: 28, color: "#059669" }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="hover:shadow-lg transition-shadow duration-300"
            style={{
              background: "#fefce8", // Yellow-50 pastel
              border: "1px solid #fde047", // Yellow-300 border
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text style={{ color: "#854d0e", fontSize: 14, fontWeight: 500 }}>
                  Pending Approvals
                </Text>
                <Title level={2} style={{ color: "#ca8a04", margin: "8px 0 0 0" }}>
                  {stats?.overview?.pendingApprovals || 0}
                </Title>
                <Text
                  style={{ color: "#a16207", fontSize: 12 }}
                >
                  Awaiting your review
                </Text>
              </div>
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 60,
                  height: 60,
                  background: "#fde047", // Yellow-300
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 28, color: "#ca8a04" }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="hover:shadow-lg transition-shadow duration-300"
            style={{
              background: "#eff6ff", // Blue-50 pastel
              border: "1px solid #bfdbfe", // Blue-200 border
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text style={{ color: "#1e3a8a", fontSize: 14, fontWeight: 500 }}>
                  Departments
                </Text>
                <Title level={2} style={{ color: "#2563eb", margin: "8px 0 0 0" }}>
                  {stats?.overview?.totalDepartments || 0}
                </Title>
                <Text
                  style={{ color: "#1e40af", fontSize: 12 }}
                >
                  Active departments
                </Text>
              </div>
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 60,
                  height: 60,
                  background: "#bfdbfe", // Blue-200
                }}
              >
                <AppstoreOutlined style={{ fontSize: 28, color: "#2563eb" }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Documents This Week</span>
              </Space>
            }
            className="shadow-sm"
          >
            <div style={{ height: 300 }}>
              {stats?.documentsPerDay && stats.documentsPerDay.length > 0 ? (
                <Column {...columnConfig} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <FileProtectOutlined />
                <span>Documents by Status</span>
              </Space>
            }
            className="shadow-sm"
          >
            <div style={{ height: 300 }}>
              {stats?.documentsByStatus && stats.documentsByStatus.length > 0 ? (
                <Pie {...pieConfig} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions & Department Stats */}
      <Row gutter={[16, 16]}>
        {/* Department Stats - Full width since signature requests are hidden */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <AppstoreOutlined />
                <span>Documents by Department</span>
              </Space>
            }
            className="shadow-sm"
            extra={
              <Button type="link" href="/admin/departments">
                Manage
              </Button>
            }
          >
            {stats?.departmentStats && stats.departmentStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.departmentStats.map((dept, index) => {
                  const maxCount = Math.max(
                    ...stats.departmentStats.map((d) => d.documentCount)
                  );
                  const percentage =
                    maxCount > 0 ? (dept.documentCount / maxCount) * 100 : 0;
                  // Orange gradient colors for theme consistency
                  const colors = [
                    "#f97316", // orange-500
                    "#fb923c", // orange-400
                    "#ea580c", // orange-600
                    "#fbbf24", // amber-400
                    "#f59e0b", // amber-500
                  ];

                  return (
                    <div key={dept.id}>
                      <div className="flex justify-between mb-1">
                        <Text>{dept.name}</Text>
                        <Text strong style={{ color: "#f97316" }}>{dept.documentCount} docs</Text>
                      </div>
                      <Progress
                        percent={percentage}
                        showInfo={false}
                        strokeColor={colors[index % colors.length]}
                        size="small"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <AppstoreOutlined style={{ fontSize: 40, marginBottom: 8 }} />
                <p>No department data</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Documents */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>Recent Documents</span>
          </Space>
        }
        className="shadow-sm"
        extra={
          <Button type="link" href="/admin/documents">
            View All
          </Button>
        }
      >
        <Table
          dataSource={stats?.recentDocuments || []}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: "Document",
              dataIndex: "title",
              key: "title",
              render: (title: string, record: any) => (
                <Space>
                  <Avatar
                    style={{ backgroundColor: "#1890ff" }}
                    icon={<FileTextOutlined />}
                    size="small"
                  />
                  <div>
                    <Text strong>{title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {record.documentNumber}
                    </Text>
                  </div>
                </Space>
              ),
            },
            {
              title: "Creator",
              dataIndex: "creator",
              key: "creator",
              render: (creator: any) => (
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text>
                    {creator?.firstName} {creator?.lastName}
                  </Text>
                </Space>
              ),
            },
            {
              title: "Department",
              dataIndex: "department",
              key: "department",
              render: (dept: any) => (
                <Tag color="blue">{dept?.name || "N/A"}</Tag>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status: string) => (
                <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
              ),
            },
            {
              title: "Created",
              dataIndex: "createdAt",
              key: "createdAt",
              render: (date: string) => (
                <Tooltip title={new Date(date).toLocaleString()}>
                  <Text type="secondary">
                    {new Date(date).toLocaleDateString()}
                  </Text>
                </Tooltip>
              ),
            },
            {
              title: "Action",
              key: "action",
              render: (_: any, record: any) => (
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  href={`/admin/documents/${record.id}`}
                >
                  View
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
