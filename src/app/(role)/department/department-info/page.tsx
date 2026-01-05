"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Spin,
  Alert,
  Avatar,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { DepartmentApi } from "@/lib/department-api";

const { Title, Text } = Typography;

interface DepartmentInfo {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  documentCount: number;
  createdAt: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const DepartmentInfoPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentInfo, setDepartmentInfo] = useState<DepartmentInfo | null>(null);

  useEffect(() => {
    fetchDepartmentInfo();
  }, []);

  const fetchDepartmentInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await DepartmentApi.getDepartmentInfo();
      // Handle nested data structure: response.data -> { message: ..., data: ... }
      if (result.data.success) {
        // Access nested data.data if it exists (from backend { data: { ... } })
        // or check if result.data.data contains the info directly
        const data = result.data.data;
        const info = (data && 'data' in data) ? data.data : data;

        if (info) {
          setDepartmentInfo(info);
        } else {
          setError("No department data found");
        }
      } else {
        setError(result.data.message || "Failed to fetch department info");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred";
      setError(errorMessage);
      console.error("Fetch department info error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f5" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!departmentInfo) {
    return (
      <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
        <Alert
          message="No Data"
          description="No department information available"
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <Title level={2} style={{ marginBottom: 24 }}>Department Information</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Statistic
              title="Total Members"
              value={departmentInfo.memberCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Statistic
              title="Total Documents"
              value={departmentInfo.documentCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<Space><TeamOutlined /><Text strong>Department Details</Text></Space>}
        bordered={false}
        style={{ marginTop: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}
      >
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="Department Name">
            <Tag color="blue">{departmentInfo.name}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created Date">
            <Space>
              <CalendarOutlined />
              {new Date(departmentInfo.createdAt).toLocaleDateString()}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {departmentInfo.description || "N/A"}
          </Descriptions.Item>
          {departmentInfo.manager && (
            <Descriptions.Item label="Manager" span={2}>
              <Space>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
                <div>
                  <div><Text strong>{departmentInfo.manager.firstName} {departmentInfo.manager.lastName}</Text></div>
                  <div><Text type="secondary">{departmentInfo.manager.email}</Text></div>
                </div>
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
};

export default DepartmentInfoPage;
