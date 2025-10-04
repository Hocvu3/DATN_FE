"use client";

import React from "react";
import { Table, Tag } from "antd";
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

interface DocumentTableProps {
  documents: Document[];
  rolePrefix: string; // "admin", "department", or "employee"
}

export default function DocumentTable({
  documents,
  rolePrefix,
}: DocumentTableProps) {
  return (
    <Table dataSource={documents} rowKey="id" pagination={false} size="small">
      <Table.Column
        title="Title"
        dataIndex="title"
        key="title"
        render={(text, record: any) => (
          <Link
            href={`/(role)/${rolePrefix}/documents/${record.id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            {text}
          </Link>
        )}
      />
      <Table.Column title="Author" dataIndex="author" key="author" />
      <Table.Column title="Date" dataIndex="date" key="date" />
      <Table.Column
        title="Status"
        dataIndex="status"
        key="status"
        render={(status: string) => {
          let color = "blue";
          let icon = <EyeOutlined />;

          if (status === "Published") {
            color = "green";
            icon = <CheckCircleOutlined />;
          } else if (status === "Draft") {
            color = "gray";
            icon = <ClockCircleOutlined />;
          } else if (status === "Pending") {
            color = "orange";
            icon = <ClockCircleOutlined />;
          }

          return (
            <Tag color={color} icon={icon}>
              {status}
            </Tag>
          );
        }}
      />
    </Table>
  );
}
