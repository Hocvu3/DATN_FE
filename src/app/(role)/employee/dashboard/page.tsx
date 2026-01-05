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
  Descriptions,
  Statistic,
} from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  FolderOpenOutlined,
  SyncOutlined,
  TrophyOutlined,
  TeamOutlined,
  HomeOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { EmployeeApi } from "@/lib/employee-api";
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

export default function EmployeeDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any | null>(null);
  const [departmentInfo, setDepartmentInfo] = useState<any | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsResponse, deptResponse] = await Promise.all([
        EmployeeApi.getDashboardStats(),
        EmployeeApi.getMyDepartment(),
      ]);
      const statsData = statsResponse.data?.data || statsResponse.data;
      setStats(statsData);
      
      if (deptResponse.data.success && deptResponse.data.data) {
        setDepartmentInfo(deptResponse.data.data);
      }
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
    color: "#047857",
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
    label: {
      type: "spider" as const,
    },
    legend: { position: "bottom" as const },
  };

  const columns = [
    {
      title: "Document",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div>
          <Link href={`/employee/documents/${record.id}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
            {text}
          </Link>
          <div className="text-xs text-gray-500">{record.documentNumber}</div>
        </div>
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
          <Title level={2} style={{ margin: 0 }}>Employee Dashboard</Title>
          <Text type="secondary">Welcome back</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchDashboardData}>
          Refresh
        </Button>
      </div>

      {departmentInfo && (
        <Card
          title={
            <Space>
              <HomeOutlined style={{ fontSize: 18, color: "#1890ff" }} />
              <Text strong>My Department</Text>
            </Space>
          }
          variant="outlined"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 8, marginBottom: 24 }}
        >
          <Descriptions column={{ xs: 1, sm: 1, md: 2 }} layout="horizontal">
            <Descriptions.Item label={<Text strong>Department Name</Text>}>
              <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                {departmentInfo.name}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Status</Text>}>
              <Tag color="green" style={{ fontSize: 14, padding: "4px 12px" }}>
                Active
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Description</Text>} span={2}>
              <Text>{departmentInfo.description || "No description available"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label={<Text strong>Created Date</Text>}>
              <Space>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <Text>{new Date(departmentInfo.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}</Text>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <Avatar size={48} icon={<FolderOpenOutlined />} style={{ backgroundColor: "#1890ff" }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>My Documents</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats?.overview?.myDocuments || 0}</Title>
                </div>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <Avatar size={48} icon={<SyncOutlined />} style={{ backgroundColor: "#faad14" }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Pending Reviews</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats?.overview?.pendingReviews || 0}</Title>
                </div>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <Avatar size={48} icon={<CheckCircleOutlined />} style={{ backgroundColor: "#52c41a" }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Completed This Month</Text>
                  <Title level={3} style={{ margin: 0 }}>{stats?.overview?.completedThisMonth || 0}</Title>
                </div>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space>
                <Avatar size={48} icon={<TrophyOutlined />} style={{ backgroundColor: "#722ed1" }} />
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Growth</Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {stats?.overview?.growthPercentage !== undefined ? `${Math.abs(stats.overview.growthPercentage)}%` : "0%"}
                  </Title>
                </div>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title={<Space><RiseOutlined /><Text strong>My Activity (Last 7 Days)</Text></Space>} 
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
            extra={<Link href="/employee/documents"><Button type="link">View All <EyeOutlined /></Button></Link>}>
            <Table columns={columns} dataSource={stats?.recentDocuments || []} rowKey="id" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
