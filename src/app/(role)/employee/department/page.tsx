"use client";

import React from "react";
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Tag, 
  Space, 
  Statistic,
  List,
  Progress,
  Timeline,
  Descriptions,
  Badge
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import Image from "next/image";

const { Title, Text, Paragraph } = Typography;

// Mock data for department information
const departmentInfo = {
  id: "DEPT-001",
  name: "Information Technology",
  description: "Responsible for managing and maintaining the company's IT infrastructure, developing software solutions, and providing technical support to all departments.",
  manager: {
    id: "MGR-001",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://i.pravatar.cc/150?img=3",
    title: "IT Department Manager"
  },
  location: "Building A, Floor 3",
  establishedDate: "2020-03-15",
  totalEmployees: 24,
  totalDocuments: 156,
  activeProjects: 8,
  departmentGoals: [
    "Modernize legacy systems by Q4 2025",
    "Implement new cybersecurity protocols",
    "Reduce system downtime by 40%",
    "Complete digital transformation initiative"
  ]
};

// Mock data for department members
const departmentMembers = [
  {
    id: "EMP-001",
    name: "Sarah Johnson",
    title: "Senior Software Developer",
    email: "sarah.johnson@company.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    status: "online",
    role: "Developer"
  },
  {
    id: "EMP-002", 
    name: "David Wilson",
    title: "DevOps Engineer",
    email: "david.wilson@company.com",
    avatar: "https://i.pravatar.cc/150?img=8",
    status: "away",
    role: "Engineer"
  },
  {
    id: "EMP-003",
    name: "Emily Davis",
    title: "UI/UX Designer",
    email: "emily.davis@company.com", 
    avatar: "https://i.pravatar.cc/150?img=6",
    status: "online",
    role: "Designer"
  },
  {
    id: "EMP-004",
    name: "Alex Kumar",
    title: "System Administrator",
    email: "alex.kumar@company.com",
    avatar: "https://i.pravatar.cc/150?img=4",
    status: "offline",
    role: "Admin"
  },
  {
    id: "EMP-005",
    name: "Jessica Wang",
    title: "QA Engineer",
    email: "jessica.wang@company.com",
    avatar: "https://i.pravatar.cc/150?img=2",
    status: "online",
    role: "QA"
  }
];

// Mock data for recent department activities
const recentActivities = [
  {
    id: "ACT-001",
    type: "document",
    title: "New security policy document uploaded",
    description: "Michael Chen uploaded updated cybersecurity guidelines",
    timestamp: "2 hours ago",
    icon: <FileTextOutlined />,
    color: "blue"
  },
  {
    id: "ACT-002", 
    type: "project",
    title: "Project milestone completed",
    description: "Digital transformation phase 2 marked as complete",
    timestamp: "5 hours ago",
    icon: <CheckCircleOutlined />,
    color: "green"
  },
  {
    id: "ACT-003",
    type: "meeting",
    title: "Department meeting scheduled",
    description: "Weekly IT team sync scheduled for Friday 2:00 PM",
    timestamp: "1 day ago", 
    icon: <CalendarOutlined />,
    color: "orange"
  },
  {
    id: "ACT-004",
    type: "announcement",
    title: "New team member joined",
    description: "Welcome Alex Kumar as our new System Administrator",
    timestamp: "3 days ago",
    icon: <UserOutlined />,
    color: "purple"
  }
];

// Mock data for department projects
const departmentProjects = [
  {
    id: "PROJ-001",
    name: "Digital Transformation Initiative",
    description: "Modernizing legacy systems and processes",
    progress: 75,
    status: "active",
    dueDate: "2025-12-31",
    lead: "Sarah Johnson"
  },
  {
    id: "PROJ-002",
    name: "Cybersecurity Enhancement",
    description: "Implementing advanced security protocols",
    progress: 45,
    status: "active", 
    dueDate: "2025-11-15",
    lead: "David Wilson"
  },
  {
    id: "PROJ-003",
    name: "User Experience Redesign",
    description: "Improving internal tools usability",
    progress: 90,
    status: "review",
    dueDate: "2025-10-30",
    lead: "Emily Davis"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "online":
      return <Badge status="success" text="Online" />;
    case "away":
      return <Badge status="warning" text="Away" />;
    case "offline":
      return <Badge status="default" text="Offline" />;
    default:
      return <Badge status="default" text="Unknown" />;
  }
};

const getProjectStatusColor = (status: string) => {
  switch (status) {
    case "active": return "blue";
    case "review": return "orange";
    case "completed": return "green";
    case "on-hold": return "red";
    default: return "default";
  }
};

export default function MyDepartmentPage() {
  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ marginBottom: 8, fontWeight: 500 }}>
            My Department
          </Title>
          <Text type="secondary">
            Overview of your department information and team activities
          </Text>
        </div>
        <div style={{ display: "none" }} className="md:block">
          <Image
            src="/departments-illustration.svg"
            alt="My Department"
            width={100}
            height={100}
          />
        </div>
      </div>

      {/* Department Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                Department Information
              </Space>
            }
            bordered={false}
            style={{ height: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <Title level={4} style={{ marginBottom: 8, display: "flex", alignItems: "center", fontWeight: 500 }}>
                  <TeamOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  {departmentInfo.name}
                </Title>
                <Paragraph type="secondary">
                  {departmentInfo.description}
                </Paragraph>
              </div>

              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Department ID">
                  <Text code>{departmentInfo.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Established">
                  {new Date(departmentInfo.establishedDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  <Space>
                    <EnvironmentOutlined />
                    {departmentInfo.location}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Total Employees">
                  <Badge count={departmentInfo.totalEmployees} style={{ backgroundColor: '#52c41a' }} />
                </Descriptions.Item>
              </Descriptions>

              {/* Department Manager */}
              <div>
                <Title level={4} className="!mb-3">Department Manager</Title>
                <Card size="small" className="bg-blue-50">
                  <div className="flex items-center space-x-4">
                    <Avatar 
                      size={64} 
                      src={departmentInfo.manager.avatar}
                      icon={<UserOutlined />}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Text strong>{departmentInfo.manager.name}</Text>
                        <Tag color="gold" icon={<CrownOutlined />}>Manager</Tag>
                      </div>
                      <Text type="secondary" className="block">
                        {departmentInfo.manager.title}
                      </Text>
                      <Space className="mt-2">
                        <Text type="secondary">
                          <MailOutlined className="mr-1" />
                          {departmentInfo.manager.email}
                        </Text>
                        <Text type="secondary">
                          <PhoneOutlined className="mr-1" />
                          {departmentInfo.manager.phone}
                        </Text>
                      </Space>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Department Statistics */}
          <Card 
            title="Department Statistics"
            className="mb-6"
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total Members"
                  value={departmentInfo.totalEmployees}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Documents"
                  value={departmentInfo.totalDocuments}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Active Projects"
                  value={departmentInfo.activeProjects}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="This Month"
                  value={12}
                  suffix="/ 15 Goals"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Department Goals */}
          <Card title="Department Goals" size="small">
            <List
              size="small"
              dataSource={departmentInfo.departmentGoals}
              renderItem={(goal, index) => (
                <List.Item>
                  <Space>
                    <Badge 
                      count={index + 1} 
                      style={{ backgroundColor: '#1890ff' }}
                      size="small"
                    />
                    <Text>{goal}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Team Members and Activities */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                Team Members ({departmentMembers.length})
              </Space>
            }
            extra={<Text type="secondary">Department colleagues</Text>}
          >
            <List
              dataSource={departmentMembers}
              renderItem={(member) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={member.avatar}
                        icon={<UserOutlined />}
                      />
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <Space>
                          <Text strong>{member.name}</Text>
                          <Tag color="blue">{member.role}</Tag>
                        </Space>
                        {getStatusBadge(member.status)}
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary">{member.title}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          <MailOutlined className="mr-1" />
                          {member.email}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                Recent Activities
              </Space>
            }
            extra={<Text type="secondary">Last 7 days</Text>}
          >
            <Timeline
              items={recentActivities.map(activity => ({
                color: activity.color,
                dot: activity.icon,
                children: (
                  <div>
                    <Text strong>{activity.title}</Text>
                    <br />
                    <Text type="secondary">{activity.description}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {activity.timestamp}
                    </Text>
                  </div>
                )
              }))}
            />
          </Card>
        </Col>
      </Row>

      {/* Department Projects */}
      <Card 
        title={
          <Space>
            <CheckCircleOutlined />
            Active Projects
          </Space>
        }
        extra={<Text type="secondary">{departmentProjects.length} projects in progress</Text>}
      >
        <Row gutter={[16, 16]}>
          {departmentProjects.map((project) => (
            <Col xs={24} md={8} key={project.id}>
              <Card size="small" className="h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Text strong>{project.name}</Text>
                    <Tag color={getProjectStatusColor(project.status)}>
                      {project.status.toUpperCase()}
                    </Tag>
                  </div>
                  
                  <Text type="secondary" className="text-sm">
                    {project.description}
                  </Text>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Text className="text-sm">Progress</Text>
                      <Text className="text-sm">{project.progress}%</Text>
                    </div>
                    <Progress 
                      percent={project.progress} 
                      size="small"
                      status={project.progress === 100 ? "success" : "active"}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <Text type="secondary">
                      Lead: {project.lead}
                    </Text>
                    <Text type="secondary">
                      Due: {new Date(project.dueDate).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}