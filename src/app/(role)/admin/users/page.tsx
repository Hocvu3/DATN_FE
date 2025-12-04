"use client";

import React, { useEffect, useState } from "react";
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
  message,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MailOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { AuthApi } from "@/lib/api";
import { UsersApi, CreateUserDto, UpdateUserDto, Role, Department } from "@/lib/users-api";

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  department?: {
    id: string;
    name: string;
  };
  role?: {
    id: string;
    name: string;
  };
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  const [form] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();

  // Fetch users
  const fetchUsers = async (page = 1, pageSize = 10, search = "") => {
    setLoading(true);
    try {
      const result = await UsersApi.getAll({
        page,
        limit: pageSize,
        search: search || undefined,
      });

      if (result.data?.data?.users) {
        setUsers(result.data.data.users);
        setPagination({
          current: result.data.data.page,
          pageSize: result.data.data.limit,
          total: result.data.data.total,
        });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to fetch users", 6);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles and departments
  const fetchRolesAndDepartments = async () => {
    try {
      const [rolesResult, departmentsResult] = await Promise.all([
        UsersApi.getRoles(),
        UsersApi.getDepartments(),
      ]);

      console.log('Roles result:', rolesResult);
      console.log('Departments result:', departmentsResult);

      // Handle nested data structure: response.data.data or response.data
      const rolesData = (rolesResult.data as any)?.data?.roles || rolesResult.data?.roles;
      const departmentsData = (departmentsResult.data as any)?.data?.departments || departmentsResult.data?.departments;

      if (rolesData) {
        setRoles(rolesData);
        console.log('Roles set:', rolesData);
      }
      if (departmentsData) {
        setDepartments(departmentsData);
        console.log('Departments set:', departmentsData);
      }
    } catch (error: any) {
      console.error("Failed to fetch roles/departments:", error);
      message.error("Failed to load roles and departments", 6);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRolesAndDepartments();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, pagination.pageSize, searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const showModal = async (user: User | null = null) => {
    // Always fetch latest roles and departments when opening modal
    await fetchRolesAndDepartments();
    
    setEditingUser(user);
    
    // Use setTimeout to ensure state is updated before opening modal
    setTimeout(() => {
      if (user) {
        form.setFieldsValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          departmentId: user.department?.id,
          roleId: user.role?.id,
          isActive: user.isActive,
        });
      } else {
        form.resetFields();
      }
      
      console.log('Opening modal with roles:', roles.length, 'departments:', departments.length);
      setIsModalVisible(true);
    }, 100);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingUser) {
        // Update user
        const updateData: UpdateUserDto = {
          departmentId: values.departmentId,
          roleId: values.roleId,
          isActive: values.isActive,
        };
        
        const result = await UsersApi.update(editingUser.id, updateData);
        
        if (result.data?.message) {
          message.success(result.data.message, 5);
          await fetchUsers(pagination.current, pagination.pageSize, searchText);
        }
      } else {
        // Create user
        const createData: CreateUserDto = {
          email: values.email,
          username: values.username,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          roleId: values.roleId,
          departmentId: values.departmentId,
        };

        const result = await UsersApi.create(createData);
        
        if (result.data?.message) {
          message.success(result.data.message, 5);
          await fetchUsers(pagination.current, pagination.pageSize, searchText);
        }
      }

      form.resetFields();
      setIsModalVisible(false);
      setEditingUser(null);
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(error.response?.data?.message || "Failed to save user", 6);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setEditingUser(null);
  };

  const handleDelete = (user: User) => {
    console.log('Delete button clicked for user:', user);
    modal.confirm({
      title: "Confirm Delete",
      content: `Are you sure you want to delete user "${user.firstName} ${user.lastName}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          console.log('Deleting user:', user.id);
          const result = await UsersApi.delete(user.id);
          console.log('Delete result:', result);
          
          if (result.status === 204 || (result.data as any)?.success || result.data?.message) {
            message.success(result.data?.message || "User deleted successfully", 5);
            await fetchUsers(pagination.current, pagination.pageSize, searchText);
          }
        } catch (error: any) {
          console.error('Delete error:', error);
          message.error(error.response?.data?.message || "Failed to delete user", 6);
        }
      },
    });
  };

  const handleToggleStatus = async (user: User) => {
    try {
      setLoading(true);
      const result = user.isActive
        ? await UsersApi.deactivate(user.id)
        : await UsersApi.activate(user.id);

      if (result.data?.message) {
        message.success(result.data.message, 5);
        await fetchUsers(pagination.current, pagination.pageSize, searchText);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to update user status", 6);
    } finally {
      setLoading(false);
    }
  };

  const showInviteModal = () => {
    inviteForm.resetFields();
    setIsInviteModalVisible(true);
  };

  const handleInviteOk = async () => {
    try {
      const values = await inviteForm.validateFields();
      setLoading(true);
      
      await AuthApi.inviteUser({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        message: values.message,
      });

      message.success("Invitation sent successfully!", 5);
      inviteForm.resetFields();
      setIsInviteModalVisible(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to send invitation. Please try again.", 6);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCancel = () => {
    inviteForm.resetFields();
    setIsInviteModalVisible(false);
  };

  const handleTableChange = (newPagination: any) => {
    fetchUsers(newPagination.current, newPagination.pageSize, searchText);
  };

  // Stats calculations
  const totalUsers = pagination.total;
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = users.filter(u => !u.isActive).length;

  const columns = [
    {
      title: "Name",
      key: "name",
      sorter: (a: User, b: User) => 
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      render: (_: any, record: User) => (
        <span className="font-medium">
          {record.firstName} {record.lastName}
        </span>
      ),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Department",
      key: "department",
      render: (_: any, record: User) => record.department?.name || "-",
    },
    {
      title: "Role",
      key: "role",
      render: (_: any, record: User) => {
        const roleName = record.role?.name || "USER";
        let color = "blue";
        if (roleName === "ADMIN") color = "red";
        if (roleName === "MANAGER") color = "green";
        return <Tag color={color}>{roleName}</Tag>;
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: User) => {
        const color = record.isActive ? "green" : "volcano";
        const text = record.isActive ? "Active" : "Inactive";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Deactivate" : "Activate"}>
            <Button
              type="text"
              icon={record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleStatus(record)}
              className={record.isActive ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
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

      {/* Stats Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Users"
              value={activeUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Inactive Users"
              value={inactiveUsers}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-md">
        <div className="flex justify-between mb-4 flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-1 md:max-w-md">
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1"
            />
          </div>
          <Space>
            <Button
              icon={<MailOutlined />}
              onClick={showInviteModal}
              className="border-orange-500 text-orange-500 hover:!bg-orange-50"
            >
              Invite User
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              className="bg-blue-600"
            >
              Add User
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          className="mt-4"
        />
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingUser ? "Update" : "Add"}
        confirmLoading={loading}
        okButtonProps={{ className: "bg-blue-600" }}
        width={600}
      >
        <Form form={form} layout="vertical" name="user_form" className="mt-4">
          {!editingUser && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: "Please enter first name" }]}
                >
                  <Input placeholder="John" />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: "Please enter last name" }]}
                >
                  <Input placeholder="Doe" />
                </Form.Item>
              </div>

              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: "Please enter username" },
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: "Username can only contain letters, numbers and underscores",
                  },
                ]}
              >
                <Input placeholder="johndoe" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="john.doe@example.com" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
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

          <Form.Item
            name="departmentId"
            label="Department"
            rules={[{ required: false }]}
          >
            <Select placeholder="Select department" allowClear>
              {departments.map((dept) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select placeholder="Select role">
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="isActive"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status">
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Invite User Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <MailOutlined className="text-orange-500" />
            <span>Invite New User</span>
          </div>
        }
        open={isInviteModalVisible}
        onOk={handleInviteOk}
        onCancel={handleInviteCancel}
        okText="Send Invitation"
        confirmLoading={loading}
        okButtonProps={{ className: "bg-orange-500 hover:!bg-orange-600" }}
        width={600}
      >
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            An invitation email will be sent to the user with a link to set up their account.
          </p>
        </div>

        <Form
          form={inviteForm}
          layout="vertical"
          name="invite_form"
          className="mt-4"
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input
              placeholder="user@example.com"
              prefix={<MailOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                { required: true, message: "Please enter first name" },
              ]}
            >
              <Input placeholder="John" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                { required: true, message: "Please enter last name" },
              ]}
            >
              <Input placeholder="Doe" />
            </Form.Item>
          </div>

          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Please enter username" },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "Username can only contain letters, numbers and underscores",
              },
            ]}
          >
            <Input placeholder="johndoe" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Welcome Message (Optional)"
            help="This message will be included in the invitation email"
          >
            <Input.TextArea
              placeholder="Welcome to our document management system! We're excited to have you on board."
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UsersPage;
