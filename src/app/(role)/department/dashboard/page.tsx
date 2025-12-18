import React from "react";
import { Card, Row, Col, Statistic, Button } from "antd";
import {
  FileTextOutlined,
  UploadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import DocumentTable from "@/components/dashboard/DocumentTable";
import PendingApprovalsList from "@/components/dashboard/PendingApprovalsList";
import UnauthorizedAccess from "@/components/auth/UnauthorizedAccess";

// Mock data for dashboard
const recentDocuments = [
  {
    id: 1,
    title: "Q3 Financial Report",
    author: "John Smith",
    date: "2023-09-25",
    status: "Published",
  },
  {
    id: 2,
    title: "Marketing Strategy 2024",
    author: "Sarah Johnson",
    date: "2023-09-24",
    status: "Pending",
  },
  {
    id: 3,
    title: "Product Roadmap",
    author: "Michael Chen",
    date: "2023-09-23",
    status: "Published",
  },
];

const pendingApprovals = [
  {
    id: 1,
    title: "Marketing Strategy 2024",
    requester: "Sarah Johnson",
    date: "2023-09-24",
  },
  {
    id: 2,
    title: "Budget Proposal",
    requester: "Robert Wilson",
    date: "2023-09-23",
  },
];

export default function DepartmentDashboardPage() {
  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <UnauthorizedAccess />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: "#262626", marginBottom: 8 }}>
            Department Dashboard
          </h1>
          <p style={{ color: "#8c8c8c" }}>Welcome back, Department Manager</p>
        </div>
        <Image
          src="/document-illustration.svg"
          alt="Dashboard"
          width={100}
          height={100}
          style={{ display: "none" }}
          className="md:block"
        />
      </div>

      {/* Stats Overview */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Statistic
              title="Department Documents"
              value={45}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
              12 new in last 30 days
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Statistic
              title="Pending Approvals"
              value={5}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#8c8c8c" }}>
              2 new requests today
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities & Approvals */}
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card
            title="Recent Documents"
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}
            extra={
              <Link
                href="/(role)/department/documents"
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            }
          >
            <DocumentTable
              documents={recentDocuments}
              rolePrefix="department"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Pending Approvals"
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}
            extra={
              <Link
                href="/(role)/department/documents?filter=pending"
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            }
          >
            <PendingApprovalsList
              pendingApprovals={pendingApprovals}
              rolePrefix="department"
            />
          </Card>

          <Card
            title="Quick Actions"
            bordered={false}
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4, marginTop: 16 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Button
                icon={<UploadOutlined />}
                type="primary"
                block
              >
                Upload Document
              </Button>
              <Button icon={<FileTextOutlined />} block>
                View Recent Documents
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
