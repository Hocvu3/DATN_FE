"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Tabs,
  Space,
  Select,
  Switch,
  Statistic,
  App,
} from "antd";
import {
  SafetyOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  UsergroupAddOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { RolesApi, Role, CreateRoleDto, UpdateRoleDto } from "@/lib/roles-api";
import { UsersApi } from "@/lib/users-api";

const { TextArea } = Input;

// Available permissions list
const AVAILABLE_PERMISSIONS = [
  { value: "documents:view", label: "View Documents" },
  { value: "documents:create", label: "Create Documents" },
  { value: "documents:edit", label: "Edit Documents" },
  { value: "documents:delete", label: "Delete Documents" },
  { value: "documents:approve", label: "Approve Documents" },
  { value: "documents:share", label: "Share Documents" },
  { value: "users:view", label: "View Users" },
  { value: "users:create", label: "Create Users" },
  { value: "users:edit", label: "Edit Users" },
  { value: "users:delete", label: "Delete Users" },
  { value: "departments:view", label: "View Departments" },
  { value: "departments:manage", label: "Manage Departments" },
  { value: "roles:view", label: "View Roles" },
  { value: "roles:manage", label: "Manage Roles" },
  { value: "system:settings", label: "System Settings" },
  { value: "system:audit", label: "Audit Logs" },
];

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
  };
  department: {
    id: string;
    name: string;
  } | null;
  isActive: boolean;
}

const RolesPermissionsPage = () => {
  const { message, modal } = App.useApp();
  const [activeTab, setActiveTab] = useState("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  // Load roles
  useEffect(() => {
    fetchRoles();
  }, []);

  // Load users when switching to User Assignment tab
  useEffect(() => {
    if (activeTab === "user-assignment") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await RolesApi.getAll();
      // Response structure: ApiResult<{ success, message, data: Role[] }>
      // So we need response.data.data to get the roles array
      const rolesData = Array.isArray(response.data?.data) ? response.data.data : [];
      setRoles(rolesData);
    } catch (error) {
      message.error("Failed to load roles: " + (error instanceof Error ? error.message : "Unknown error"));
      setRoles([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UsersApi.getAll({ page: 1, limit: 1000 }); // Get all users
      // Response structure: ApiResult<{ success, message, data: User[] }>
      // So we need response.data.data to get the users array
      const usersData = Array.isArray(response.data?.data) ? response.data.data : [];
      setUsers(usersData);
    } catch (error) {
      message.error("Failed to load users: " + (error instanceof Error ? error.message : "Unknown error"));
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const showRoleModal = (role: Role | null = null) => {
    setEditingRole(role);
    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true }); // Default to active
    }
    setIsRoleModalVisible(true);
  };

  const handleRoleCancel = () => {
    setIsRoleModalVisible(false);
    setEditingRole(null);
    form.resetFields();
  };

  const handleRoleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingRole) {
        // Update existing role
        await RolesApi.update(editingRole.id, values);
        message.success("Role updated successfully");
      } else {
        // Create new role
        await RolesApi.create(values);
        message.success("Role created successfully");
      }

      handleRoleCancel();
      fetchRoles();
    } catch (error) {
      message.error("Failed to save role: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = (role: Role) => {
    modal.confirm({
      title: "Delete Role",
      content: `Are you sure you want to delete the role "${role.name}"? ${
        role.userCount && role.userCount > 0
          ? `This role is assigned to ${role.userCount} user(s). Please reassign users before deleting.`
          : ""
      }`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          await RolesApi.delete(role.id);
          message.success("Role deleted successfully");
          fetchRoles();
        } catch (error) {
          message.error("Failed to delete role: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const showAssignModal = (user: User) => {
    setSelectedUser(user);
    assignForm.setFieldsValue({
      roleId: user.role.id,
    });
    setIsAssignModalVisible(true);
  };

  const handleAssignCancel = () => {
    setIsAssignModalVisible(false);
    setSelectedUser(null);
    assignForm.resetFields();
  };

  const handleAssignRole = async () => {
    if (!selectedUser) return;

    try {
      const values = await assignForm.validateFields();
      setLoading(true);

      await RolesApi.assignToUser(values.roleId, selectedUser.id);
      message.success("Role assigned successfully");

      handleAssignCancel();
      fetchUsers();
    } catch (error) {
      message.error("Failed to assign role: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const roleColumns = [
    {
      title: "Role Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Space>
          <SafetyOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      key: "permissions",
      render: (permissions: string[]) => (
        <Space size={[0, 4]} wrap>
          {permissions.slice(0, 3).map((perm) => (
            <Tag key={perm} color="blue">
              {perm}
            </Tag>
          ))}
          {permissions.length > 3 && <Tag>+{permissions.length - 3} more</Tag>}
        </Space>
      ),
    },
    {
      title: "Users",
      dataIndex: "userCount",
      key: "userCount",
      width: 100,
      render: (count: number) => (
        <Tag icon={<TeamOutlined />} color="cyan">
          {count || 0}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? "success" : "default"}
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: Role) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showRoleModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteRole(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const userColumns = [
    {
      title: "User",
      key: "user",
      render: (_: any, record: User) => (
        <Space>
          <strong>
            {record.firstName} {record.lastName}
          </strong>
          <Tag>{record.username}</Tag>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Current Role",
      key: "role",
      render: (_: any, record: User) => (
        <Tag color="blue" icon={<SafetyOutlined />}>
          {record.role.name}
        </Tag>
      ),
    },
    {
      title: "Department",
      key: "department",
      render: (_: any, record: User) =>
        record.department ? (
          <Tag color="purple">{record.department.name}</Tag>
        ) : (
          <Tag>No Department</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => showAssignModal(record)}
        >
          Change Role
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: "roles",
      label: (
        <Space>
          <SafetyOutlined />
          Role Management
        </Space>
      ),
      children: (
        <div>
          {/* Stats */}
          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Roles"
                  value={roles.length}
                  prefix={<SafetyOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Active Roles"
                  value={roles.filter((r) => r.isActive).length}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Users Assigned"
                  value={roles.reduce((sum, r) => sum + (r.userCount || 0), 0)}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Actions */}
          <div className="mb-4 text-right">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showRoleModal()}
            >
              Create New Role
            </Button>
          </div>

          {/* Table */}
          <Table
            columns={roleColumns}
            dataSource={roles}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} roles`,
            }}
          />
        </div>
      ),
    },
    {
      key: "user-assignment",
      label: (
        <Space>
          <UsergroupAddOutlined />
          User Assignment
        </Space>
      ),
      children: (
        <div>
          <Card className="mb-4">
            <div className="text-gray-600">
              Assign or change roles for users in the system. Users will inherit
              permissions based on their assigned role.
            </div>
          </Card>

          <Table
            columns={userColumns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Roles Management</h1>
          <p className="text-gray-600">Manage roles and user assignments</p>
        </div>
      </div>

      <Card className="shadow-md">
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* Role Create/Edit Modal */}
      <Modal
        title={editingRole ? "Edit Role" : "Create New Role"}
        open={isRoleModalVisible}
        onOk={handleRoleSubmit}
        onCancel={handleRoleCancel}
        okText={editingRole ? "Update" : "Create"}
        okButtonProps={{ loading }}
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: "Please enter role name" }]}
          >
            <Input placeholder="e.g., Department Manager" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Describe the role's purpose and responsibilities"
            />
          </Form.Item>

          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[
              { required: true, message: "Please select at least one permission" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select permissions"
              options={AVAILABLE_PERMISSIONS}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Role Modal */}
      <Modal
        title="Assign Role to User"
        open={isAssignModalVisible}
        onOk={handleAssignRole}
        onCancel={handleAssignCancel}
        okText="Assign"
        okButtonProps={{ loading }}
      >
        {selectedUser && (
          <div className="mb-4">
            <div className="text-gray-600 mb-2">User:</div>
            <div className="font-medium">
              {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Current Role: <Tag color="blue">{selectedUser.role.name}</Tag>
            </div>
          </div>
        )}

        <Form form={assignForm} layout="vertical" className="mt-4">
          <Form.Item
            name="roleId"
            label="New Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select
              placeholder="Select role"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            >
              {roles
                .filter((r) => r.isActive)
                .map((role) => (
                  <Select.Option key={role.id} value={role.id} label={role.name}>
                    <Space>
                      <SafetyOutlined />
                      {role.name}
                      {role.description && (
                        <span className="text-gray-500 text-xs">
                          - {role.description}
                        </span>
                      )}
                    </Space>
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesPermissionsPage;
