"use client";

import { Card, Row, Col, Statistic } from "antd";
import {
  UserOutlined,
  FileOutlined,
  TeamOutlined,
  TagOutlined,
} from "@ant-design/icons";

export default function AdminDashboard() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={25}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Documents"
              value={142}
              prefix={<FileOutlined />}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Departments"
              value={8}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tags"
              value={32}
              prefix={<TagOutlined />}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <p className="py-2 border-b">
            User John Doe uploaded document &quot;Financial Report Q3.pdf&quot;
          </p>
          <p className="py-2 border-b">
            Admin updated department &quot;Marketing&quot;
          </p>
          <p className="py-2 border-b">
            Jane Smith requested signature for &quot;Contract NDA-2023.pdf&quot;
          </p>
          <p className="py-2 border-b">
            New user Sarah Johnson was added to system
          </p>
          <p className="py-2">
            Document &quot;Strategic Plan 2024.docx&quot; was approved
          </p>
        </Card>
      </div>
    </>
  );
}
