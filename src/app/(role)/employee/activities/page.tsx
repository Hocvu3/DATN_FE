"use client";

import React, { useState } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Space, 
  List,
  Timeline,
  Tabs,
  Avatar,
  Badge,
  Statistic,
  Calendar,
  Select,
  DatePicker,
  Button,
  Empty
} from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  EditOutlined,
  UploadOutlined,
  TeamOutlined,
  BellOutlined,
  EyeOutlined,
  FilterOutlined
} from "@ant-design/icons";
import Image from "next/image";
import type { TabsProps } from 'antd';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Mock data for user activities
const recentActivities = [
  {
    id: "ACT-001",
    type: "upload",
    title: "Uploaded document",
    description: "Q3 Performance Report.pdf",
    timestamp: "2 hours ago",
    date: "2025-10-01T14:30:00Z",
    icon: <UploadOutlined />,
    color: "blue",
    details: "2.5 MB file uploaded successfully"
  },
  {
    id: "ACT-002", 
    type: "edit",
    title: "Updated document",
    description: "Modified Marketing Strategy 2025.docx",
    timestamp: "4 hours ago",
    date: "2025-10-01T12:15:00Z", 
    icon: <EditOutlined />,
    color: "green",
    details: "Last modified: Added Q4 projections section"
  },
  {
    id: "ACT-003",
    type: "share",
    title: "Shared document",
    description: "Shared API Documentation with Development Team",
    timestamp: "6 hours ago",
    date: "2025-10-01T10:45:00Z",
    icon: <ShareAltOutlined />,
    color: "purple",
    details: "Shared with 5 team members"
  },
  {
    id: "ACT-004",
    type: "download",
    title: "Downloaded document", 
    description: "Employee Handbook 2025.pdf",
    timestamp: "1 day ago",
    date: "2025-09-30T16:20:00Z",
    icon: <DownloadOutlined />,
    color: "orange",
    details: "Downloaded for offline review"
  },
  {
    id: "ACT-005",
    type: "comment",
    title: "Added comment",
    description: "Commented on Project Proposal Draft",
    timestamp: "1 day ago",
    date: "2025-09-30T14:10:00Z",
    icon: <MessageOutlined />,
    color: "cyan",
    details: "Suggested improvements to budget section"
  },
  {
    id: "ACT-006",
    type: "view",
    title: "Viewed document",
    description: "Security Protocol Guidelines",
    timestamp: "2 days ago",
    date: "2025-09-29T11:30:00Z",
    icon: <EyeOutlined />,
    color: "default",
    details: "Read time: 15 minutes"
  }
];

// Mock data for upcoming events/deadlines
const upcomingEvents = [
  {
    id: "EVT-001",
    title: "Project deadline",
    description: "Submit Q4 Budget Proposal",
    date: "2025-10-05",
    time: "17:00",
    type: "deadline",
    priority: "high"
  },
  {
    id: "EVT-002",
    title: "Team meeting",
    description: "Weekly IT Department Sync",
    date: "2025-10-04",
    time: "14:00",
    type: "meeting",
    priority: "medium"
  },
  {
    id: "EVT-003",
    title: "Document review",
    description: "Review Security Policy Update",
    date: "2025-10-06",
    time: "10:00", 
    type: "review",
    priority: "medium"
  },
  {
    id: "EVT-004",
    title: "Training session",
    description: "Cybersecurity Awareness Training",
    date: "2025-10-08",
    time: "09:00",
    type: "training", 
    priority: "low"
  }
];

// Mock data for notifications
const notifications = [
  {
    id: "NOT-001",
    type: "approval",
    title: "Document approved",
    description: "Your Marketing Strategy document has been approved by Michael Chen",
    timestamp: "3 hours ago",
    read: false,
    priority: "high"
  },
  {
    id: "NOT-002",
    type: "share",
    title: "New document shared",
    description: "Sarah Johnson shared 'API Security Guidelines' with you",
    timestamp: "5 hours ago", 
    read: false,
    priority: "medium"
  },
  {
    id: "NOT-003",
    type: "comment",
    title: "New comment",
    description: "David Wilson commented on your Project Proposal",
    timestamp: "1 day ago",
    read: true,
    priority: "low"
  },
  {
    id: "NOT-004",
    type: "deadline",
    title: "Deadline reminder",
    description: "Q4 Budget Proposal is due in 3 days",
    timestamp: "1 day ago",
    read: true,
    priority: "high"
  }
];

// Mock data for activity statistics
const activityStats = {
  documentsUploaded: 12,
  documentsViewed: 45,
  documentsShared: 8,
  commentsAdded: 15,
  totalActivities: 80
};

const getActivityIcon = (type: string) => {
  const icons = {
    upload: <UploadOutlined />,
    edit: <EditOutlined />,
    share: <ShareAltOutlined />,
    download: <DownloadOutlined />,
    comment: <MessageOutlined />,
    view: <EyeOutlined />
  };
  return icons[type as keyof typeof icons] || <ClockCircleOutlined />;
};

const getActivityColor = (type: string) => {
  const colors = {
    upload: "blue",
    edit: "green", 
    share: "purple",
    download: "orange",
    comment: "cyan",
    view: "default"
  };
  return colors[type as keyof typeof colors] || "default";
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "red";
    case "medium": return "orange";
    case "low": return "green";
    default: return "default";
  }
};

const getEventTypeIcon = (type: string) => {
  const icons = {
    deadline: <ExclamationCircleOutlined />,
    meeting: <TeamOutlined />,
    review: <EyeOutlined />,
    training: <FileTextOutlined />
  };
  return icons[type as keyof typeof icons] || <CalendarOutlined />;
};

const getNotificationIcon = (type: string) => {
  const icons = {
    approval: <CheckCircleOutlined />,
    share: <ShareAltOutlined />,
    comment: <MessageOutlined />,
    deadline: <ExclamationCircleOutlined />
  };
  return icons[type as keyof typeof icons] || <BellOutlined />;
};

export default function MyActivitiesPage() {
  const [activeTab, setActiveTab] = useState("activities");
  const [activityFilter, setActivityFilter] = useState("all");

  const filteredActivities = recentActivities.filter(activity => {
    if (activityFilter !== "all" && activity.type !== activityFilter) {
      return false;
    }
    // Add date filtering logic here if needed
    return true;
  });

  const tabItems: TabsProps['items'] = [
    {
      key: "activities",
      label: (
        <Space>
          <ClockCircleOutlined />
          Recent Activities
        </Space>
      ),
      children: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Filters */}
          <Card size="small" bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <Select
                  value={activityFilter}
                  onChange={setActivityFilter}
                  style={{ width: "100%" }}
                  placeholder="Filter by type"
                >
                  <Select.Option value="all">All Activities</Select.Option>
                  <Select.Option value="upload">Uploads</Select.Option>
                  <Select.Option value="edit">Edits</Select.Option>
                  <Select.Option value="share">Shares</Select.Option>
                  <Select.Option value="download">Downloads</Select.Option>
                  <Select.Option value="comment">Comments</Select.Option>
                  <Select.Option value="view">Views</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={10}>
                <RangePicker
                  style={{ width: "100%" }}
                  onChange={() => {}}
                  placeholder={["Start date", "End date"]}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Button icon={<FilterOutlined />} block>
                  Apply Filters
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Activities List */}
          <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            {filteredActivities.length > 0 ? (
              <Timeline
                items={filteredActivities.map(activity => ({
                  color: getActivityColor(activity.type),
                  dot: getActivityIcon(activity.type),
                  children: (
                    <div className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Text strong>{activity.title}</Text>
                          <Tag color={getActivityColor(activity.type)} className="ml-2">
                            {activity.type.toUpperCase()}
                          </Tag>
                        </div>
                        <Text type="secondary" className="text-sm">
                          {activity.timestamp}
                        </Text>
                      </div>
                      <Text type="secondary" className="block mt-1">
                        {activity.description}
                      </Text>
                      <Text type="secondary" className="block mt-1 text-xs">
                        {activity.details}
                      </Text>
                    </div>
                  )
                }))}
              />
            ) : (
              <Empty description="No activities found" />
            )}
          </Card>
        </div>
      )
    },
    {
      key: "calendar",
      label: (
        <Space>
          <CalendarOutlined />
          Calendar & Events
        </Space>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Calendar View">
              <Calendar />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Upcoming Events" className="mb-4">
              <List
                dataSource={upcomingEvents}
                renderItem={(event) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={getEventTypeIcon(event.type)}
                          style={{ 
                            backgroundColor: event.type === 'deadline' ? '#ff4d4f' :
                                            event.type === 'meeting' ? '#1890ff' :
                                            event.type === 'review' ? '#fa8c16' : '#52c41a'
                          }}
                        />
                      }
                      title={
                        <div className="flex items-center justify-between">
                          <Text strong>{event.title}</Text>
                          <Tag color={getPriorityColor(event.priority)}>
                            {event.priority.toUpperCase()}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Text type="secondary">{event.description}</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            <CalendarOutlined className="mr-1" />
                            {event.date} at {event.time}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: "notifications",
      label: (
        <Space>
          <BellOutlined />
          Notifications
          <Badge count={notifications.filter(n => !n.read).length} />
        </Space>
      ),
      children: (
        <Card>
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item 
                className={!notification.read ? "bg-blue-50" : ""}
                actions={[
                  <Button type="text" size="small" key="mark-read">
                    {notification.read ? "Mark Unread" : "Mark Read"}
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getNotificationIcon(notification.type)}
                      style={{ 
                        backgroundColor: !notification.read ? '#1890ff' : '#f0f0f0',
                        color: !notification.read ? 'white' : '#999'
                      }}
                    />
                  }
                  title={
                    <div className="flex items-center justify-between">
                      <Text strong={!notification.read}>{notification.title}</Text>
                      <Space>
                        <Tag color={getPriorityColor(notification.priority)}>
                          {notification.priority.toUpperCase()}
                        </Tag>
                        {!notification.read && <Badge status="processing" />}
                      </Space>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary">{notification.description}</Text>
                      <br />
                      <Text type="secondary" className="text-xs">
                        {notification.timestamp}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ marginBottom: 8, fontWeight: 500 }}>
            My Activities
          </Title>
          <Text type="secondary">
            Track your document activities, events, and notifications
          </Text>
        </div>
        <div style={{ display: "none" }} className="md:block">
          <Image
            src="/profile-illustration.svg"
            alt="My Activities"
            width={100}
            height={100}
          />
        </div>
      </div>

      {/* Activity Statistics */}
      <Card title="Activity Overview" bordered={false} style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
        <Row gutter={[24, 16]}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Documents Uploaded"
              value={activityStats.documentsUploaded}
              prefix={<UploadOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Documents Viewed"
              value={activityStats.documentsViewed}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Documents Shared"
              value={activityStats.documentsShared}
              prefix={<ShareAltOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Comments Added"
              value={activityStats.commentsAdded}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Main Content Tabs */}
      <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>
    </div>
  );
}