"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Spin,
  Alert,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
} from "antd";
import {
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  HomeOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { EmployeeApi } from "@/lib/employee-api";

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

const MyDepartmentPage = () => {
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
      const result = await EmployeeApi.getMyDepartment();
      if (result.data.success && result.data.data) {
        setDepartmentInfo(result.data.data);
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
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <Space>
              <HomeOutlined />
              My Department
            </Space>
          </Title>
          <Text type="secondary">View your department information and statistics</Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              variant="outlined"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                borderRadius: 8,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <Statistic
                title={<span style={{ color: "white", fontSize: 14 }}>Department Members</span>}
                value={departmentInfo.memberCount}
                prefix={<TeamOutlined style={{ color: "white" }} />}
                valueStyle={{ color: "white", fontSize: 32, fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              variant="outlined"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                borderRadius: 8,
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <Statistic
                title={<span style={{ color: "white", fontSize: 14 }}>Total Documents</span>}
                value={departmentInfo.documentCount}
                prefix={<FileTextOutlined style={{ color: "white" }} />}
                valueStyle={{ color: "white", fontSize: 32, fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              variant="outlined"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                borderRadius: 8,
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <Statistic
                title={<span style={{ color: "white", fontSize: 14 }}>Member Since</span>}
                value={new Date(departmentInfo.createdAt).toLocaleDateString()}
                prefix={<CalendarOutlined style={{ color: "white" }} />}
                valueStyle={{ color: "white", fontSize: 20, fontWeight: "bold" }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title={
            <Space>
              <IdcardOutlined style={{ fontSize: 20, color: "#1890ff" }} />
              <Text strong style={{ fontSize: 16 }}>Department Information</Text>
            </Space>
          }
          variant="outlined"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 8 }}
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
      </Space>
    </div>
  );
};

export default MyDepartmentPage;
