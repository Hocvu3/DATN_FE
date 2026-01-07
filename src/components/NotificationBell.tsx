"use client";

import React, { useState } from "react";
import { Badge, Popover, List, Button, Typography, Empty } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { useNotifications } from "@/contexts/NotificationContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    isConnected,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "DOCUMENT_CREATED":
      case "DOCUMENT_UPDATED":
        return "📄";
      case "APPROVAL_GRANTED":
        return "✅";
      case "APPROVAL_REJECTED":
        return "❌";
      case "SYSTEM_ALERT":
        return "🔔";
      default:
        return "ℹ️";
    }
  };

  const content = (
    <div style={{ width: 380, maxHeight: 500, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Text strong style={{ fontSize: 16 }}>
          Notifications
        </Text>
        <div style={{ display: "flex", gap: 8 }}>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all notifications?')) {
                  clearAllNotifications();
                }
              }}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
      <div
        style={{
          maxHeight: 400,
          overflowY: "auto",
        }}
      >
        {notifications.length === 0 ? (
          <Empty
            description="No notifications"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "40px 0" }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                key={notification.id}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  backgroundColor: notification.isRead
                    ? "transparent"
                    : "#e6f7ff",
                  borderBottom: "1px solid #f0f0f0",
                }}
                onClick={() =>
                  handleNotificationClick(notification.id, notification.isRead)
                }
              >
                <List.Item.Meta
                  avatar={
                    <span style={{ fontSize: 24 }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <Text
                        strong={!notification.isRead}
                        style={{
                          fontSize: 14,
                          flex: 1,
                        }}
                      >
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <Badge status="processing" />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#666",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        {notification.message}
                      </Text>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {dayjs(notification.createdAt).fromNow()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      {!isConnected && (
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid #f0f0f0",
            background: "#fff7e6",
            textAlign: "center",
          }}
        >
          <Text type="warning" style={{ fontSize: 12 }}>
            ⚠️ Backend offline - Check if server is running
          </Text>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      overlayStyle={{ paddingTop: 8 }}
    >
      <Badge count={unreadCount} offset={[-5, 5]} size="small">
        <BellOutlined
          style={{
            fontSize: 18,
            cursor: "pointer",
            color: isConnected ? "#1890ff" : "#999",
          }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
