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
    <div className="space-y-6">
      <UnauthorizedAccess />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Department Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, Department Manager</p>
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
        <Col xs={24} sm={12}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Department Documents"
              value={45}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
            <div className="mt-2 text-xs text-gray-500">
              12 new in last 30 days
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Pending Approvals"
              value={5}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
            <div className="mt-2 text-xs text-gray-500">
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
            variant="borderless"
            className="shadow-sm"
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
            variant="borderless"
            className="shadow-sm"
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
