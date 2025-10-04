"use client";

import React from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import Image from "next/image";

// Mock data for user management
const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    department: "Marketing",
    role: "User",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    department: "Human Resources",
    role: "Admin",
    status: "Active",
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    department: "Finance",
    role: "User",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    department: "IT",
    role: "Manager",
    status: "Active",
  },
  {
    id: 5,
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    department: "Sales",
    role: "User",
    status: "Active",
  },
  {
    id: 6,
    name: "Sarah Brown",
    email: "sarah.brown@example.com",
    department: "Marketing",
    role: "Manager",
    status: "Inactive",
  },
  {
    id: 7,
    name: "David Miller",
    email: "david.miller@example.com",
    department: "IT",
    role: "Admin",
    status: "Active",
  },
];

const departments = ["Marketing", "Human Resources", "Finance", "IT", "Sales"];
const roles = ["Admin", "Manager", "User"];
const statuses = ["Active", "Inactive"];

const UsersPage = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<any>(null);
  const [form] = Form.useForm();

  const showModal = (user: any = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue(user);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      // Here we would handle saving the user data
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <a className="text-blue-600 hover:underline">{text}</a>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      filters: departments.map((dept) => ({ text: dept, value: dept })),
      onFilter: (value: any, record: any) => record.department === value,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: roles.map((role) => ({ text: role, value: role })),
      onFilter: (value: any, record: any) => record.role === value,
      render: (role: string) => {
        let color = "blue";
        if (role === "Admin") color = "red";
        if (role === "Manager") color = "green";
        return <Tag color={color}>{role}</Tag>;
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
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: "Are you sure you want to delete this user?",
                  content: `This will permanently delete ${record.name} from the system.`,
                  okText: "Yes, Delete",
                  okType: "danger",
                  cancelText: "No",
                  onOk() {
                    console.log("OK");
                    // Here we would handle the deletion
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
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            User Management
          </h1>
          <p className="text-gray-600">Manage users, roles and permissions</p>
        </div>
        <div className="flex items-center">
          <Image
            src="/users-illustration.svg"
            alt="Users Management"
            width={100}
            height={100}
            className="hidden md:block"
          />
        </div>
      </div>

      <Card className="shadow-md">
        <div className="flex justify-between mb-4 flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-1 md:max-w-md">
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="flex-1"
            />
            <Button
              icon={<FilterOutlined />}
              className="bg-white border-gray-200"
            >
              Filter
            </Button>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            className="bg-blue-600"
          >
            Add User
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          className="mt-4"
        />
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingUser ? "Update" : "Add"}
        okButtonProps={{ className: "bg-blue-600" }}
      >
        <Form form={form} layout="vertical" name="user_form" className="mt-4">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter user name" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: "Please select department" }]}
          >
            <Select placeholder="Select department">
              {departments.map((dept) => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select placeholder="Select role">
              {roles.map((role) => (
                <Select.Option key={role} value={role}>
                  {role}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

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

          {!editingUser && (
            <>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Please enter password" }]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

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
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default UsersPage;
