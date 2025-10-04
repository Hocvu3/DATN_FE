"use client";

import React, { useState } from "react";
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
  Alert,
  Tabs,
  Checkbox,
  Divider,
  Space,
  Select,
  Switch,
  Avatar,
  Statistic,
} from "antd";
import {
  SafetyOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  SecurityScanOutlined,
  DeleteOutlined,
  SettingOutlined,
  CrownOutlined,
  UsergroupAddOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import Image from "next/image";

// Mock data for global roles and permissions management
const globalRoles = [
  {
    id: 1,
    roleName: "System Administrator",
    description: "Full system access with all administrative privileges",
    userCount: 2,
    departmentCount: 0,
    permissions: {
      system: {
        user_management: true,
        department_management: true,
        role_management: true,
        system_settings: true,
        security_settings: true,
        audit_logs: true,
      },
      documents: {
        view_all: true,
        create: true,
        edit_all: true,
        delete_all: true,
        approve_all: true,
        share_external: true,
      },
      workflows: {
        create: true,
        edit: true,
        delete: true,
        manage_all: true,
      },
    },
    isSystem: true,
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    roleName: "Department Administrator",
    description: "Administrative access within assigned departments",
    userCount: 5,
    departmentCount: 3,
    permissions: {
      system: {
        user_management: false,
        department_management: false,
        role_management: false,
        system_settings: false,
        security_settings: false,
        audit_logs: false,
      },
      documents: {
        view_all: false,
        create: true,
        edit_all: false,
        delete_all: false,
        approve_all: true,
        share_external: false,
      },
      workflows: {
        create: true,
        edit: true,
        delete: false,
        manage_all: false,
      },
    },
    isSystem: true,
    createdAt: "2024-01-15",
  },
  {
    id: 3,
    roleName: "Document Reviewer",
    description: "Specialized role for document review and approval",
    userCount: 8,
    departmentCount: 2,
    permissions: {
      system: {
        user_management: false,
        department_management: false,
        role_management: false,
        system_settings: false,
        security_settings: false,
        audit_logs: false,
      },
      documents: {
        view_all: true,
        create: false,
        edit_all: false,
        delete_all: false,
        approve_all: true,
        share_external: false,
      },
      workflows: {
        create: false,
        edit: false,
        delete: false,
        manage_all: false,
      },
    },
    isSystem: false,
    createdAt: "2024-02-01",
  },
  {
    id: 4,
    roleName: "Regular Employee",
    description: "Standard access for department employees",
    userCount: 45,
    departmentCount: 5,
    permissions: {
      system: {
        user_management: false,
        department_management: false,
        role_management: false,
        system_settings: false,
        security_settings: false,
        audit_logs: false,
      },
      documents: {
        view_all: false,
        create: true,
        edit_all: false,
        delete_all: false,
        approve_all: false,
        share_external: false,
      },
      workflows: {
        create: false,
        edit: false,
        delete: false,
        manage_all: false,
      },
    },
    isSystem: true,
    createdAt: "2024-01-01",
  },
];

const permissionCategories = [
  {
    title: "System Administration",
    key: "system",
    children: [
      { title: "User Management", key: "user_management" },
      { title: "Department Management", key: "department_management" },
      { title: "Role Management", key: "role_management" },
      { title: "System Settings", key: "system_settings" },
      { title: "Security Settings", key: "security_settings" },
      { title: "Audit Logs", key: "audit_logs" },
    ],
  },
  {
    title: "Document Management",
    key: "documents",
    children: [
      { title: "View All Documents", key: "view_all" },
      { title: "Create Documents", key: "create" },
      { title: "Edit All Documents", key: "edit_all" },
      { title: "Delete All Documents", key: "delete_all" },
      { title: "Approve All Documents", key: "approve_all" },
      { title: "Share Externally", key: "share_external" },
    ],
  },
  {
    title: "Workflow Management",
    key: "workflows",
    children: [
      { title: "Create Workflows", key: "create" },
      { title: "Edit Workflows", key: "edit" },
      { title: "Delete Workflows", key: "delete" },
      { title: "Manage All Workflows", key: "manage_all" },
    ],
  },
];

// Mock user assignments data
const userAssignments = [
  {
    id: 1,
    name: "John Admin",
    email: "john.admin@company.com",
    currentRole: "System Administrator",
    department: "IT Department",
    assignedAt: "2024-01-15",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Manager",
    email: "jane.manager@company.com",
    currentRole: "Department Administrator",
    department: "Engineering",
    assignedAt: "2024-02-01",
    status: "Active",
  },
  {
    id: 3,
    name: "Bob Reviewer",
    email: "bob.reviewer@company.com",
    currentRole: "Document Reviewer",
    department: "Legal",
    assignedAt: "2024-02-15",
    status: "Active",
  },
];

const AdminRolesPermissionsPage = () => {
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("roles");

  const showRoleModal = (role: any = null) => {
    setEditingRole(role);
    if (role) {
      form.setFieldsValue({
        roleName: role.roleName,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      form.resetFields();
    }
    setIsRoleModalVisible(true);
  };

  const handleRoleOk = () => {
    form.validateFields().then((values) => {
      console.log("Role form values:", values);
      form.resetFields();
      setIsRoleModalVisible(false);
    });
  };

  const handleRoleCancel = () => {
    form.resetFields();
    setIsRoleModalVisible(false);
  };

  const showAssignModal = () => {
    assignForm.resetFields();
    setIsAssignModalVisible(true);
  };

  const handleAssignOk = () => {
    assignForm.validateFields().then((values) => {
      console.log("Assignment form values:", values);
      assignForm.resetFields();
      setIsAssignModalVisible(false);
    });
  };

  const handleAssignCancel = () => {
    assignForm.resetFields();
    setIsAssignModalVisible(false);
  };

  const roleColumns = [
    {
      title: "Role Information",
      dataIndex: "roleName",
      key: "roleName",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
            {record.isSystem ? (
              <LockOutlined className="text-blue-600 text-lg" />
            ) : (
              <UnlockOutlined className="text-green-600 text-lg" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500 max-w-xs truncate">
              {record.description}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {record.isSystem ? "System Role" : "Custom Role"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Usage Statistics",
      key: "usage",
      render: (_: any, record: any) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            <span className="text-sm">
              <span className="font-medium">{record.userCount}</span> users
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-green-500" />
            <span className="text-sm">
              <span className="font-medium">{record.departmentCount}</span> departments
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Permissions Summary",
      key: "permissions",
      render: (_: any, record: any) => {
        const totalPerms = Object.values(record.permissions).reduce(
          (acc: number, category: any) => 
            acc + Object.values(category).filter(Boolean).length,
          0
        );
        const maxPerms = permissionCategories.reduce(
          (acc, cat) => acc + cat.children.length,
          0
        );
        
        return (
          <div className="space-y-2">
            <Tag color="blue">
              {totalPerms}/{maxPerms} permissions
            </Tag>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(totalPerms / maxPerms) * 100}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Edit Role">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showRoleModal(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          {!record.isSystem && (
            <Tooltip title="Delete Role">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  Modal.confirm({
                    title: "Delete Role?",
                    content: `This will permanently delete the "${record.roleName}" role. Users with this role will lose their permissions.`,
                    okText: "Yes, Delete",
                    okType: "danger",
                    cancelText: "Cancel",
                    onOk() {
                      console.log("Delete role");
                    },
                  })
                }
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const assignmentColumns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Current Role",
      dataIndex: "currentRole",
      key: "currentRole",
      render: (role: string) => (
        <Tag icon={<CrownOutlined />} color="blue">
          {role}
        </Tag>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Assigned Date",
      dataIndex: "assignedAt",
      key: "assignedAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-600 hover:text-blue-800"
          >
            Change Role
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "roles",
      label: (
        <span className="flex items-center gap-2">
          <SafetyOutlined />
          Role Management
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800">System Roles</h3>
              <p className="text-gray-600">Manage global roles and their permissions</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showRoleModal()}
              className="bg-blue-600"
            >
              Create Role
            </Button>
          </div>

          {/* Statistics Cards */}
          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Total Roles"
                  value={globalRoles.length}
                  prefix={<SafetyOutlined className="text-blue-600" />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="System Roles"
                  value={globalRoles.filter(r => r.isSystem).length}
                  prefix={<LockOutlined className="text-orange-600" />}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Custom Roles"
                  value={globalRoles.filter(r => !r.isSystem).length}
                  prefix={<UnlockOutlined className="text-green-600" />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Total Users"
                  value={globalRoles.reduce((acc, role) => acc + role.userCount, 0)}
                  prefix={<UserOutlined className="text-purple-600" />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          <Table
            columns={roleColumns}
            dataSource={globalRoles}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} roles`,
            }}
          />
        </div>
      ),
    },
    {
      key: "assignments",
      label: (
        <span className="flex items-center gap-2">
          <UsergroupAddOutlined />
          User Assignments
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Role Assignments</h3>
              <p className="text-gray-600">Manage user role assignments across the system</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAssignModal}
              className="bg-blue-600"
            >
              Assign Role
            </Button>
          </div>

          <Table
            columns={assignmentColumns}
            dataSource={userAssignments}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} assignments`,
            }}
          />
        </div>
      ),
    },
    {
      key: "matrix",
      label: (
        <span className="flex items-center gap-2">
          <AuditOutlined />
          Permission Matrix
        </span>
      ),
      children: (
        <div>
          <Alert
            message="System Permission Matrix"
            description="View all roles and their permissions in a comprehensive matrix format."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Permission</th>
                    {globalRoles.map(role => (
                      <th key={role.id} className="text-center p-3 font-medium min-w-40">
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{role.roleName}</span>
                          <span className="text-xs text-gray-500 mt-1">
                            {role.userCount} users
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionCategories.map(category => (
                    <React.Fragment key={category.key}>
                      <tr className="bg-gray-50">
                        <td colSpan={globalRoles.length + 1} className="p-3 font-semibold text-gray-700">
                          {category.title}
                        </td>
                      </tr>
                      {category.children.map(permission => (
                        <tr key={permission.key} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-gray-700">{permission.title}</td>
                          {globalRoles.map(role => (
                            <td key={role.id} className="p-3 text-center">
                              {(role.permissions as any)[category.key]?.[permission.key] ? (
                                <Tag color="green">✓</Tag>
                              ) : (
                                <Tag color="red">✗</Tag>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Roles & Permissions Management
          </h1>
          <p className="text-gray-600">Manage system-wide roles and access controls</p>
        </div>
        <div className="flex items-center">
          <Image
            src="/signatures-illustration.svg"
            alt="Roles & Permissions"
            width={100}
            height={100}
            className="hidden md:block"
          />
        </div>
      </div>

      <Card className="shadow-md">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Role Creation/Edit Modal */}
      <Modal
        title={editingRole ? "Edit Role" : "Create New Role"}
        open={isRoleModalVisible}
        onOk={handleRoleOk}
        onCancel={handleRoleCancel}
        okText={editingRole ? "Update" : "Create"}
        okButtonProps={{ className: "bg-blue-600" }}
        width={900}
      >
        <Form form={form} layout="vertical" name="role_form" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleName"
                label="Role Name"
                rules={[{ required: true, message: "Please enter role name" }]}
              >
                <Input placeholder="Enter role name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: "Please enter description" }]}
              >
                <Input placeholder="Enter role description" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>System Permissions</Divider>

          {permissionCategories.map(category => (
            <div key={category.key} className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <SettingOutlined />
                {category.title}
              </h4>
              <div className="grid grid-cols-2 gap-4 pl-6">
                {category.children.map(permission => (
                  <Form.Item
                    key={permission.key}
                    name={['permissions', category.key, permission.key]}
                    valuePropName="checked"
                  >
                    <Checkbox>{permission.title}</Checkbox>
                  </Form.Item>
                ))}
              </div>
            </div>
          ))}
        </Form>
      </Modal>

      {/* Role Assignment Modal */}
      <Modal
        title="Assign Role to User"
        open={isAssignModalVisible}
        onOk={handleAssignOk}
        onCancel={handleAssignCancel}
        okText="Assign"
        okButtonProps={{ className: "bg-blue-600" }}
        width={600}
      >
        <Form form={assignForm} layout="vertical" name="assign_form" className="mt-4">
          <Form.Item
            name="userId"
            label="Select User"
            rules={[{ required: true, message: "Please select a user" }]}
          >
            <Select
              placeholder="Choose user to assign role"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={userAssignments.map(user => ({
                value: user.id,
                label: `${user.name} (${user.email})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Select Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select
              placeholder="Choose role to assign"
              options={globalRoles.map(role => ({
                value: role.id,
                label: role.roleName,
                description: role.description,
              }))}
              optionRender={(option) => (
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.data.description}</div>
                </div>
              )}
            />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="Department (Optional)"
            tooltip="Leave empty for system-wide role assignment"
          >
            <Select
              placeholder="Select department scope"
              allowClear
              options={[
                { value: 1, label: "Engineering Department" },
                { value: 2, label: "Marketing Department" },
                { value: 3, label: "Legal Department" },
                { value: 4, label: "HR Department" },
                { value: 5, label: "Finance Department" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="temporary"
            label="Temporary Assignment"
            valuePropName="checked"
          >
            <Switch checkedChildren="Temporary" unCheckedChildren="Permanent" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminRolesPermissionsPage;