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
    name: string;
    count: number;
    color: string;
  }>;
  usersByStatus: Array<{
    status: string;
    name: string;
    count: number;
    color: string;
  }>;
  topDepartments: Array<{
    name: string;
    count: number;
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
    colorField: "name",
    radius: 0.8,
    innerRadius: 0.6,
    color: (datum: any) => {
      const item = stats?.documentsByStatus?.find((d) => d.name === datum.name);
      return item?.color || "#ccc";
    },
    label: {
      type: "spider" as const,
      formatter: (datum: any) => `${datum?.name || 'Unknown'}: ${datum?.count || 0}`,
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
    appendPadding: 10,
  };

  const usersPieConfig = {
    data: stats?.usersByStatus || [],
    angleField: "count",
    colorField: "name",
    radius: 0.75,
    color: (datum: any) => {
      const item = stats?.usersByStatus?.find((d) => d.name === datum.name);
      return item?.color || "#ccc";
    },
    label: {
      type: "inner" as const,
      offset: "-30%",
      formatter: (datum: any) => String(datum?.count || 0),
      style: {
        fontSize: 14,
        fontWeight: "bold",
        fill: "#fff",
      },
    },
    legend: {
      position: "bottom" as const,
    },
    appendPadding: 10,
  };

  const departmentsPieConfig = {
    data: stats?.topDepartments || [],
    angleField: "count",
    colorField: "name",
    radius: 0.75,
    color: ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1"],
    label: {
      type: "spider" as const,
      formatter: (datum: any) => `${datum?.name || 'Unknown'}: ${datum?.count || 0}`,
    },
    legend: {
      position: "bottom" as const,
    },
    appendPadding: 10,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      {contextHolder}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 500 }}>
              Dashboard
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Overview of your system
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
      </div>

      {/* Stats Cards - Material Design style */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
            <Space direction="vertical" size={0} style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Total Documents
              </Text>
              <Title level={2} style={{ margin: "8px 0", fontWeight: 500 }}>
                {stats?.overview?.totalDocuments || 0}
              </Title>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 14, color: "#4caf50" }}>
                  <FileTextOutlined /> {stats?.overview?.documentsThisMonth || 0} new in last 30 days
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
            <Space direction="vertical" size={0} style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Total Users
              </Text>
              <Title level={2} style={{ margin: "8px 0", fontWeight: 500 }}>
                {stats?.overview?.totalUsers || 0}
              </Title>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 14, color: "#666" }}>
                  <TeamOutlined /> Active across {stats?.overview?.totalDepartments || 0} departments
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
            <Space direction="vertical" size={0} style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Pending Approvals
              </Text>
              <Title level={2} style={{ margin: "8px 0", fontWeight: 500 }}>
                {stats?.overview?.pendingApprovals || 0}
              </Title>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 14, color: "#ff9800" }}>
                  <ClockCircleOutlined /> Awaiting review
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
            <Space direction="vertical" size={0} style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Departments
              </Text>
              <Title level={2} style={{ margin: "8px 0", fontWeight: 500 }}>
                {stats?.overview?.totalDepartments || 0}
              </Title>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 14, color: "#666" }}>
                  <AppstoreOutlined /> Marketing, HR, Finance, IT, Sales
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Pie Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card 
            title="Documents by Status" 
            variant="borderless"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
          >
            <div style={{ height: 280 }}>
              {stats?.documentsByStatus && stats.documentsByStatus.length > 0 ? (
                <Pie {...pieConfig} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
                  No data available
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card 
            title="Users by Status" 
            variant="borderless"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
          >
            <div style={{ height: 280 }}>
              {stats?.usersByStatus && stats.usersByStatus.length > 0 ? (
                <Pie {...usersPieConfig} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
                  No data available
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card 
            title="Top Departments" 
            variant="borderless"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
          >
            <div style={{ height: 280 }}>
              {stats?.topDepartments && stats.topDepartments.length > 0 ? (
                <Pie {...departmentsPieConfig} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
                  No data available
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Column Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card 
            title="Documents This Week" 
            variant="borderless"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
          >
            <div style={{ height: 300 }}>
              {stats?.documentsPerDay && stats.documentsPerDay.length > 0 ? (
                <Column {...columnConfig} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
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
