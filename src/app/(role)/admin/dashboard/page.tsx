import React from "react";
import { Card, Row, Col, Statistic, Button } from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  AppstoreOutlined,
  UploadOutlined,
  UserOutlined,
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
  {
    id: 4,
    title: "HR Policy Update",
    author: "Emily Davis",
    date: "2023-09-22",
    status: "Draft",
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
  {
    id: 3,
    title: "Project Timeline",
    requester: "Lisa Wang",
    date: "2023-09-21",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <UnauthorizedAccess />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, Admin</p>
        </div>
        <Image
          src="/document-illustration.svg"
          alt="Dashboard"
          width={100}
          height={100}
          className="hidden md:block"
        />
      </div>

      {/* Stats Overview */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Total Documents"
              value={157}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
            <div className="mt-2 text-xs text-gray-500">
              24 new in last 30 days
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Total Users"
              value={128}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div className="mt-2 text-xs text-gray-500">
              Active across 5 departments
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Departments"
              value={5}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
            <div className="mt-2 text-xs text-gray-500">
              Marketing, HR, Finance, IT, Sales
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities & Approvals */}
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card
            title="Recent Documents"
            variant="borderless"
            className="shadow-sm"
            extra={
              <Link
                href="/(role)/admin/documents"
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            }
          >
            <DocumentTable documents={recentDocuments} rolePrefix="admin" />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Pending Approvals"
            variant="borderless"
            className="shadow-sm"
            extra={
              <Link
                href="/(role)/admin/documents?filter=pending"
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            }
          >
            <PendingApprovalsList
              pendingApprovals={pendingApprovals}
              rolePrefix="admin"
            />
          </Card>

          <Card
            title="Quick Actions"
            variant="borderless"
            className="shadow-sm mt-4"
          >
            <div className="space-y-2">
              <Button
                icon={<UploadOutlined />}
                type="primary"
                block
                className="bg-blue-600"
              >
                Upload Document
              </Button>
              <Button icon={<TeamOutlined />} block>
                Manage Users
              </Button>
              <Button icon={<AppstoreOutlined />} block>
                Department Settings
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
