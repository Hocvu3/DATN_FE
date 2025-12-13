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
  List,
  Modal,
  Select,
  Tooltip,
  Badge,
} from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileProtectOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { apiGet } from "@/lib/api";
import { SignaturesApi } from "@/lib/signatures-api";
import { VersionApi } from "@/lib/version-api";
import { DocumentStatus } from "@/lib/types/document.types";
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

interface SignatureRequest {
  id: string;
  documentVersion: {
    id: string;
    versionNumber: number;
    document: {
      id: string;
      title: string;
      documentNumber: string;
    };
  };
  requester: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  createdAt: string;
  expiresAt?: string;
}

interface Stamp {
  id: string;
  name: string;
  imageUrl: string;
  isActive: boolean;
}

export default function AdminDashboardPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([]);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SignatureRequest | null>(null);
  const [selectedStampId, setSelectedStampId] = useState<string | undefined>();
  const [approving, setApproving] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await apiGet<any>("/documents/dashboard-stats");
      const statsData = statsResponse.data?.data || statsResponse.data;
      setStats(statsData);

      // Fetch pending signature requests
      const requestsResponse = await apiGet<any>("/signatures/requests", {
        params: {
          status: "PENDING",
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });
      const requestsData = requestsResponse.data?.data?.requests || [];
      setSignatureRequests(requestsData);

      // Fetch active stamps
      const stampsResponse = await SignaturesApi.getActive();
      const stampsData = (stampsResponse.data as any)?.data || [];
      setStamps(Array.isArray(stampsData) ? stampsData : []);
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

  const handleApproveClick = (request: SignatureRequest) => {
    setSelectedRequest(request);
    setSelectedStampId(undefined);
    setApproveModalVisible(true);
  };

  const handleApproveWithStamp = async () => {
    if (!selectedRequest || !selectedStampId) {
      messageApi.error("Please select a stamp");
      return;
    }

    try {
      setApproving(true);

      // Apply signature with type=2 (with hash)
      await SignaturesApi.applySignature({
        documentId: selectedRequest.documentVersion.document.id,
        signatureStampId: selectedStampId,
        reason: "Document approved via dashboard",
        type: 2,
      });

      // Update version status to APPROVED
      await VersionApi.updateVersionStatus(
        selectedRequest.documentVersion.document.id,
        selectedRequest.documentVersion.id,
        DocumentStatus.APPROVED
      );

      messageApi.success("Document approved successfully with signature!");
      setApproveModalVisible(false);
      setSelectedRequest(null);
      setSelectedStampId(undefined);
      fetchDashboardData();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || "Failed to approve document");
    } finally {
      setApproving(false);
    }
  };

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

  // Chart configurations
  const columnConfig = {
    data: stats?.documentsPerDay || [],
    xField: "dayName",
    yField: "count",
    color: "#1890ff",
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: "top" as const,
      style: {
        fill: "#666",
        fontSize: 12,
      },
    },
    xAxis: {
      label: {
        style: {
          fontSize: 12,
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fontSize: 12,
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

      {/* Stats Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="hover:shadow-lg transition-shadow duration-300"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                  Total Documents
                </Text>
                <Title level={2} style={{ color: "#fff", margin: "8px 0 0 0" }}>
                  {stats?.overview?.totalDocuments || 0}
                </Title>
                <div className="flex items-center mt-2">
                  {(stats?.overview?.growthPercentage || 0) >= 0 ? (
                    <RiseOutlined style={{ color: "#52c41a" }} />
                  ) : (
                    <FallOutlined style={{ color: "#ff4d4f" }} />
                  )}
                  <Text
                    style={{
                      color:
                        (stats?.overview?.growthPercentage || 0) >= 0
                          ? "#52c41a"
                          : "#ff4d4f",
                      marginLeft: 4,
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
                  background: "rgba(255,255,255,0.2)",
                }}
              >
                <FileTextOutlined style={{ fontSize: 28, color: "#fff" }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="hover:shadow-lg transition-shadow duration-300"
            style={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              border: "none",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                  Total Users
                </Text>
                <Title level={2} style={{ color: "#fff", margin: "8px 0 0 0" }}>
                  {stats?.overview?.totalUsers || 0}
                </Title>
                <Text
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}
                >
                  Active across {stats?.overview?.totalDepartments || 0} departments
                </Text>
              </div>
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 60,
                  height: 60,
                  background: "rgba(255,255,255,0.2)",
                }}
              >
                <TeamOutlined style={{ fontSize: 28, color: "#fff" }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="hover:shadow-lg transition-shadow duration-300"
            style={{
              background: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
              border: "none",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                  Pending Approvals
                </Text>
                <Title level={2} style={{ color: "#fff", margin: "8px 0 0 0" }}>
                  {stats?.overview?.pendingApprovals || 0}
                </Title>
                <Text
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}
                >
                  Awaiting your review
                </Text>
              </div>
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 60,
                  height: 60,
                  background: "rgba(255,255,255,0.2)",
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 28, color: "#fff" }} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="hover:shadow-lg transition-shadow duration-300"
            style={{
              background: "linear-gradient(135deg, #0052D4 0%, #65C7F7 50%, #9CECFB 100%)",
              border: "none",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                  Departments
                </Text>
                <Title level={2} style={{ color: "#fff", margin: "8px 0 0 0" }}>
                  {stats?.overview?.totalDepartments || 0}
                </Title>
                <Text
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}
                >
                  Active departments
                </Text>
              </div>
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 60,
                  height: 60,
                  background: "rgba(255,255,255,0.2)",
                }}
              >
                <AppstoreOutlined style={{ fontSize: 28, color: "#fff" }} />
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
        {/* Signature Requests - Quick Actions */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />
                <span>Pending Signature Requests</span>
                <Badge
                  count={signatureRequests.length}
                  style={{ backgroundColor: "#faad14" }}
                />
              </Space>
            }
            className="shadow-sm"
            extra={
              <Button type="link" href="/admin/signatures">
                View All
              </Button>
            }
          >
            {signatureRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircleOutlined style={{ fontSize: 40, marginBottom: 8 }} />
                <p>No pending signature requests</p>
              </div>
            ) : (
              <List
                dataSource={signatureRequests.slice(0, 5)}
                renderItem={(request) => (
                  <List.Item
                    actions={[
                      <Button
                        key="approve"
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApproveClick(request)}
                      >
                        Approve
                      </Button>,
                      <Button
                        key="view"
                        size="small"
                        icon={<EyeOutlined />}
                        href={`/admin/documents/${request.documentVersion.document.id}`}
                      >
                        View
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ backgroundColor: "#1890ff" }}
                          icon={<FileTextOutlined />}
                        />
                      }
                      title={
                        <span>
                          {request.documentVersion.document.title}{" "}
                          <Tag color="blue">
                            v{request.documentVersion.versionNumber}
                          </Tag>
                        </span>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Requested by: {request.requester.firstName}{" "}
                            {request.requester.lastName}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(request.createdAt).toLocaleDateString()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Department Stats */}
        <Col xs={24} lg={12}>
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
              <div className="space-y-4">
                {stats.departmentStats.map((dept, index) => {
                  const maxCount = Math.max(
                    ...stats.departmentStats.map((d) => d.documentCount)
                  );
                  const percentage =
                    maxCount > 0 ? (dept.documentCount / maxCount) * 100 : 0;
                  const colors = [
                    "#1890ff",
                    "#52c41a",
                    "#faad14",
                    "#722ed1",
                    "#eb2f96",
                  ];

                  return (
                    <div key={dept.id}>
                      <div className="flex justify-between mb-1">
                        <Text>{dept.name}</Text>
                        <Text strong>{dept.documentCount} docs</Text>
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

      {/* Approve Modal */}
      <Modal
        title="Approve with Signature Stamp"
        open={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedRequest(null);
          setSelectedStampId(undefined);
        }}
        onOk={handleApproveWithStamp}
        okText="Approve & Sign"
        okButtonProps={{ loading: approving, disabled: !selectedStampId }}
        cancelText="Cancel"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <Text strong>Document:</Text>
              <p>{selectedRequest.documentVersion.document.title}</p>
            </div>
            <div>
              <Text strong>Version:</Text>
              <Tag color="blue">v{selectedRequest.documentVersion.versionNumber}</Tag>
            </div>
            <div>
              <Text strong>Requested by:</Text>
              <p>
                {selectedRequest.requester.firstName}{" "}
                {selectedRequest.requester.lastName}
              </p>
            </div>
            <div>
              <Text strong>Select Stamp:</Text>
              <Select
                placeholder="Select a signature stamp"
                style={{ width: "100%", marginTop: 8 }}
                value={selectedStampId}
                onChange={setSelectedStampId}
              >
                {stamps.map((stamp) => (
                  <Select.Option key={stamp.id} value={stamp.id}>
                    <Space>
                      <Avatar src={stamp.imageUrl} size="small" />
                      {stamp.name}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
