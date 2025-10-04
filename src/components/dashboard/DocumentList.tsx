"use client";

import React from "react";
import { List, Button, Tag } from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";

interface Document {
  id: number;
  title: string;
  author: string;
  date: string;
  status: string;
}

interface DocumentListProps {
  documents: Document[];
  rolePrefix: string; // "employee", "admin", or "department"
}

export default function DocumentList({
  documents,
  rolePrefix,
}: DocumentListProps) {
  return (
    <List
      itemLayout="horizontal"
      dataSource={documents}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              key="view"
              type="link"
              icon={<EyeOutlined />}
              className="text-blue-600"
            >
              View
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span>By: {item.author}</span>
                <span className="hidden sm:inline text-gray-300">•</span>
                <span>{item.date}</span>
                <span className="hidden sm:inline text-gray-300">•</span>
                <Tag
                  color={
                    item.status === "Published"
                      ? "green"
                      : item.status === "Draft"
                      ? "gray"
                      : "orange"
                  }
                  icon={
                    item.status === "Published" ? (
                      <CheckCircleOutlined />
                    ) : (
                      <ClockCircleOutlined />
                    )
                  }
                >
                  {item.status}
                </Tag>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}
