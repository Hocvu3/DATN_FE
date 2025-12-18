"use client";

import React, { useState } from "react";
import { Card, Row, Col, Statistic, Button } from "antd";
import {
  FileTextOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import DocumentList from "@/components/dashboard/DocumentList";
import UnauthorizedAccess from "@/components/auth/UnauthorizedAccess";
import UploadDocumentModal from "@/components/employee/UploadDocumentModal";

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

export default function EmployeeDashboardPage() {
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

  const showUploadModal = () => {
    setIsUploadModalVisible(true);
  };

  const handleUploadCancel = () => {
    setIsUploadModalVisible(false);
  };

  const handleUploadSubmit = (values: any) => {
    setIsUploadModalVisible(false);
  };

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <UnauthorizedAccess />
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: "rgba(0,0,0,0.87)" }}>
              Dashboard
            </h1>
            <p style={{ color: "rgba(0,0,0,0.6)", fontSize: 14, marginTop: 4 }}>Welcome back</p>
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
      </div>

      {/* Stats Overview */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="My Documents"
              value={12}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
            <div className="mt-2 text-xs text-gray-500">
              3 new in last 30 days
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Shared With Me"
              value={28}
              prefix={<EyeOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <div className="mt-2 text-xs text-gray-500">
              5 new shares this week
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={16}>
        <Col xs={24}>
          <Card
            title="Recent Documents"
            variant="borderless"
            className="shadow-sm"
            extra={
              <Link
                href="/(role)/employee/documents"
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            }
          >
            <DocumentList documents={recentDocuments} rolePrefix="employee" />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" variant="borderless" className="shadow-sm">
        <div className="flex justify-center">
          <Button
            icon={<UploadOutlined />}
            type="primary"
            className="bg-blue-600 h-auto py-4 px-8"
            size="large"
            onClick={showUploadModal}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg font-medium">Upload Document</span>
              <span className="text-sm opacity-80 mt-1">
                Share files with your team
              </span>
            </div>
          </Button>
        </div>
      </Card>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        open={isUploadModalVisible}
        onCancel={handleUploadCancel}
        onSubmit={handleUploadSubmit}
      />
    </div>
  );
}
