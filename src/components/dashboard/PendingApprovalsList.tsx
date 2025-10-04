"use client";

import React from "react";
import { List, Button, Space } from "antd";
import Link from "next/link";

interface PendingApproval {
  id: number;
  title: string;
  requester: string;
  date: string;
}

interface PendingApprovalsListProps {
  pendingApprovals: PendingApproval[];
  rolePrefix: string; // "admin", "department", or "employee"
}

export default function PendingApprovalsList({
  pendingApprovals,
  rolePrefix,
}: PendingApprovalsListProps) {
  return (
    <List
      itemLayout="horizontal"
      dataSource={pendingApprovals}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              key="approve"
              type="link"
              className="text-green-600"
              size="small"
            >
              Approve
            </Button>,
            <Button key="reject" type="link" danger size="small">
              Reject
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={
              <Link
                href={`/(role)/${rolePrefix}/documents/${item.id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {item.title}
              </Link>
            }
            description={
              <Space direction="vertical" size={0}>
                <span>Requested by: {item.requester}</span>
                <span className="text-gray-400 text-xs">{item.date}</span>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
}
