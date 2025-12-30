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
} from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import { DepartmentApi } from "@/lib/department-api";
import dynamic from "next/dynamic";
import Link from "next/link";
import dayjs from "dayjs";

const Column = dynamic(
  () => import("@ant-design/charts").then((mod) => mod.Column),
  { ssr: false }
);
const Pie = dynamic(
  () => import("@ant-design/charts").then((mod) => mod.Pie),
  { ssr: false }
);

const { Title, Text } = Typography;

export default function DepartmentDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const statsResponse = await DepartmentApi.getDashboardStats();
      const statsData = statsResponse.data?.data || statsResponse.data;
      setStats(statsData);
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
    };
    return colors[status] || "default";
  };

  const columnConfig = {
    data: stats?.documentsPerDay || [],
    xField: "dayName",
    yField: "count",
    color: "#0369a1",
    columnStyle: { radius: [8, 8, 0, 0] },
    label: { position: "top" as const },
  };

  const pieConfig = {
    data: stats?.documentsByStatus || [],
    angleField: "count",
    colorField: "name",
    radius: 0.8,
    innerRadius: 0.6,
    color: (datum: any) => stats?.documentsByStatus?.find((d: any) => d.name === datum.name)?.color || "#ccc",
    label: { type: "outer" as const },
    legend: { position: "bottom" as const },
  };

  const columns = [
    {
      title: "Document",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div>
          <Link href={`/department/documents/${record.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
            {text}
          </Link>
          <div className="text-xs text-gray-500">{record.documentNumber}</div>
        </div>
      ),
    },
    {
      title: "Creator",
      key: "creator",
      render: (_: any, record: any) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span className="text-sm">{`${record.creator.firstName} ${record.creator.lastName}`}</span>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.replace(/_/g, " ")}</Tag>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f5" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      {contextHolder}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Department Dashboard</Title>
          <Text type="secondary">Welcome back, Department Manager</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchDashboardData}>
          Refresh
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <Avatar size={48} icon={<FileTextOutlined />} style={{ backgroundColor: "#1890ff" }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Department Documents</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats?.overview?.totalDocuments || 0}</Title>
                </div>
              </Space>
              {stats?.overview?.growthPercentage !== undefined && (
                <Space>
                  {stats.overview.growthPercentage >= 0 ? <RiseOutlined style={{ color: "#10b981" }} /> : <FallOutlined style={{ color: "#ef4444" }} />}
                  <Text style={{ color: stats.overview.growthPercentage >= 0 ? "#10b981" : "#ef4444", fontSize: 12 }}>
                    {Math.abs(stats.overview.growthPercentage)}% this month
                  </Text>
                </Space>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <Avatar size={48} icon={<TeamOutlined />} style={{ backgroundColor: "#52c41a" }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Team Members</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats?.overview?.totalMembers || 0}</Title>
                </div>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <Avatar size={48} icon={<ClockCircleOutlined />} style={{ backgroundColor: "#faad14" }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Pending Approvals</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats?.overview?.pendingApprovals || 0}</Title>
                </div>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <Avatar size={48} icon={<CalendarOutlined />} style={{ backgroundColor: "#722ed1" }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>This Month</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats?.overview?.documentsThisMonth || 0}</Title>
                </div>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<Space><FileTextOutlined /><Text strong>Documents Activity (Last 7 Days)</Text></Space>} 
            bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Column {...columnConfig} />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<Space><FileProtectOutlined /><Text strong>Documents by Status</Text></Space>} 
            bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24}>
          <Card title={<Space><FileTextOutlined /><Text strong>Recent Documents</Text></Space>} 
            bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}
            extra={<Link href="/department/documents"><Button type="link">View All <EyeOutlined /></Button></Link>}>
            <Table columns={columns} dataSource={stats?.recentDocuments || []} rowKey="id" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

