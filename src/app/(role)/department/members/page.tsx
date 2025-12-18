"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Input,
  Select,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  Space,
  Avatar,
  Row,
  Col,
  Statistic,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";

// Mock data for member management in department context
const members = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    position: "Senior Developer",
    role: "Member",
    status: "Active",
    joinDate: "2023-01-15",
    avatar: null,
    department: "Engineering",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    position: "Product Manager",
    role: "Manager",
    status: "Active",
    joinDate: "2022-08-03",
    avatar: null,
    department: "Engineering",
    lastActive: "30 minutes ago",
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    position: "UI/UX Designer",
    role: "Member",
    status: "Inactive",
    joinDate: "2023-03-22",
    avatar: null,
    department: "Engineering",
    lastActive: "2 days ago",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    position: "Backend Developer",
    role: "Member",
    status: "Active",
    joinDate: "2023-02-10",
    avatar: null,
    department: "Engineering",
    lastActive: "1 hour ago",
  },
  {
    id: 5,
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    position: "QA Engineer",
    role: "Member",
    status: "Active",
    joinDate: "2023-05-07",
    avatar: null,
    department: "Engineering",
    lastActive: "45 minutes ago",
  },
  {
    id: 6,
    name: "Sarah Brown",
    email: "sarah.brown@example.com",
    position: "Frontend Developer",
    role: "Member",
    status: "Active",
    joinDate: "2022-11-18",
    avatar: null,
    department: "Engineering",
    lastActive: "3 hours ago",
  },
  {
    id: 7,
    name: "David Miller",
    email: "david.miller@example.com",
    position: "DevOps Engineer",
    role: "Member",
    status: "Active",
    joinDate: "2023-07-01",
    avatar: null,
    department: "Engineering",
    lastActive: "20 minutes ago",
  },
];

const positions = [
  "Senior Developer",
  "Product Manager",
  "UI/UX Designer",
  "Backend Developer",
  "Frontend Developer",
  "DevOps Engineer",
  "QA Engineer",
];

const roles = ["Manager", "Member"];
const statuses = ["Active", "Inactive"];

const DepartmentMembersPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [form] = Form.useForm();

  const showModal = (member: any = null) => {
    setEditingMember(member);
    if (member) {
      form.setFieldsValue(member);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      // Here we would handle saving the member data
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const activeMembers = members.filter(m => m.status === "Active").length;
  const managerCount = members.filter(m => m.role === "Manager").length;

  const columns = [
    {
      title: "Member",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <Link href="#" className="text-blue-600 hover:underline font-medium">
              {text}
            </Link>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      filters: positions.map((pos) => ({ text: pos, value: pos })),
      onFilter: (value: any, record: any) => record.position === value,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: roles.map((role) => ({ text: role, value: role })),
      onFilter: (value: any, record: any) => record.role === value,
      render: (role: string) => {
        let color = "blue";
        let icon = <UserOutlined />;
        if (role === "Manager") {
          color = "green";
          icon = <CrownOutlined />;
        }
        return (
          <Tag color={color} icon={icon}>
            {role}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: statuses.map((status) => ({ text: status, value: status })),
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => {
        const color = status === "Active" ? "green" : "volcano";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
      render: (text: string) => (
        <span className="text-gray-600">{text}</span>
      ),
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      sorter: (a: any, b: any) =>
        new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Edit Member">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Remove from Department">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: "Remove Member from Department?",
                  content: `This will remove ${record.name} from this department. They will lose access to department resources.`,
                  okText: "Yes, Remove",
                  okType: "danger",
                  cancelText: "Cancel",
                  onOk() {
                    // Here we would handle the removal
                  },
                })
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: "#262626", marginBottom: 8 }}>
            Department Members
          </h1>
          <p style={{ color: "#8c8c8c" }}>Manage team members and their roles</p>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Image
            src="/users-illustration.svg"
            alt="Members Management"
            width={100}
            height={100}
            style={{ display: "none" }}
            className="md:block"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Statistic
              title="Total Members"
              value={members.length}
              prefix={<TeamOutlined className="text-blue-600" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Statistic
              title="Active Members"
              value={activeMembers}
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
            <Statistic
              title="Managers"
              value={managerCount}
              prefix={<CrownOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, flexDirection: "column", gap: 16 }} className="md:flex-row">
          <div style={{ display: "flex", gap: 8, flex: 1 }} className="md:max-w-md">
            <Input
              placeholder="Search members..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              style={{ flex: 1 }}
            />
            <Button
              icon={<FilterOutlined />}
            >
              Filter
            </Button>
          </div>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => showModal()}
          >
            Add Member
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} members`,
          }}
          className="mt-4"
        />
      </Card>

      <Modal
        title={editingMember ? "Edit Member" : "Add Member to Department"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingMember ? "Update" : "Add"}
        okButtonProps={{ className: "bg-blue-600" }}
        width={600}
      >
        <Form form={form} layout="vertical" name="member_form" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: "Please enter member name" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[{ required: true, message: "Please select position" }]}
              >
                <Select placeholder="Select position">
                  {positions.map((pos) => (
                    <Select.Option key={pos} value={pos}>
                      {pos}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Department Role"
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role">
                  {roles.map((role) => (
                    <Select.Option key={role} value={role}>
                      <span className="flex items-center gap-2">
                        {role === "Manager" ? <CrownOutlined /> : <UserOutlined />}
                        {role}
                      </span>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              {statuses.map((status) => (
                <Select.Option key={status} value={status}>
                  {status}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {!editingMember && (
            <>
              <Divider />
              <h4 className="mb-4 text-gray-700">Initial Account Setup</h4>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Initial Password"
                    rules={[{ required: true, message: "Please enter password" }]}
                  >
                    <Input.Password placeholder="Enter password" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "Please confirm password" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Confirm password" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentMembersPage;