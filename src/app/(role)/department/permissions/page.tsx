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
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons";
import Image from "next/image";

// Mock data for permissions management
const rolePermissions = [
  {
    id: 1,
    roleName: "Department Manager",
    description: "Full access to department resources and member management",
    memberCount: 2,
    permissions: {
      documents: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        approve: true,
        share: true,
      },
      members: {
        view: true,
        invite: true,
        edit: true,
        remove: true,
        manage_roles: true,
      },
      settings: {
        department_settings: true,
        permissions: true,
        workflows: true,
      },
    },
    isSystem: true,
  },
  {
    id: 2,
    roleName: "Senior Member",
    description: "Advanced access with document approval rights",
    memberCount: 3,
    permissions: {
      documents: {
        view: true,
        create: true,
        edit: true,
        delete: false,
        approve: true,
        share: true,
      },
      members: {
        view: true,
        invite: false,
        edit: false,
        remove: false,
        manage_roles: false,
      },
      settings: {
        department_settings: false,
        permissions: false,
        workflows: false,
      },
    },
    isSystem: false,
  },
  {
    id: 3,
    roleName: "Regular Member",
    description: "Standard access for department members",
    memberCount: 8,
    permissions: {
      documents: {
        view: true,
        create: true,
        edit: false,
        delete: false,
        approve: false,
        share: false,
      },
      members: {
        view: true,
        invite: false,
        edit: false,
        remove: false,
        manage_roles: false,
      },
      settings: {
        department_settings: false,
        permissions: false,
        workflows: false,
      },
    },
    isSystem: true,
  },
];

const permissionCategories = [
  {
    title: "Document Management",
    key: "documents",
    children: [
      { title: "View Documents", key: "view" },
      { title: "Create Documents", key: "create" },
      { title: "Edit Documents", key: "edit" },
      { title: "Delete Documents", key: "delete" },
      { title: "Approve Documents", key: "approve" },
      { title: "Share Documents", key: "share" },
    ],
  },
  {
    title: "Member Management",
    key: "members",
    children: [
      { title: "View Members", key: "view" },
      { title: "Invite Members", key: "invite" },
      { title: "Edit Member Details", key: "edit" },
      { title: "Remove Members", key: "remove" },
      { title: "Manage Member Roles", key: "manage_roles" },
    ],
  },
  {
    title: "Department Settings",
    key: "settings",
    children: [
      { title: "Department Settings", key: "department_settings" },
      { title: "Permission Management", key: "permissions" },
      { title: "Workflow Configuration", key: "workflows" },
    ],
  },
];

const DepartmentPermissionsPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("roles");

  const showModal = (role: any = null) => {
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
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      // Here we would handle saving the role data
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const roleColumns = [
    {
      title: "Role Name",
      dataIndex: "roleName",
      key: "roleName",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
            {record.isSystem ? (
              <LockOutlined className="text-blue-600" />
            ) : (
              <UnlockOutlined className="text-green-600" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">
              {record.isSystem ? "System Role" : "Custom Role"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Members",
      dataIndex: "memberCount",
      key: "memberCount",
      render: (count: number) => (
        <Tag icon={<UserOutlined />} color="blue">
          {count} {count === 1 ? "member" : "members"}
        </Tag>
      ),
    },
    {
      title: "Permissions",
      key: "permissions",
      render: (_: any, record: any) => {
        const totalPerms = Object.values(record.permissions).reduce(
          (acc: number, category: any) => 
            acc + Object.values(category).filter(Boolean).length,
          0
        );
        return (
          <Tag color="green">
            {totalPerms} permissions
          </Tag>
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
              onClick={() => showModal(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          {!record.isSystem && (
            <Tooltip title="Delete Role">
              <Button
                type="text"
                danger
                icon={<KeyOutlined />}
                onClick={() =>
                  Modal.confirm({
                    title: "Delete Role?",
                    content: `This will permanently delete the "${record.roleName}" role. Members with this role will lose their permissions.`,
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



  const tabItems = [
    {
      key: "roles",
      label: (
        <span className="flex items-center gap-2">
          <TeamOutlined />
          Role Management
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Department Roles</h3>
              <p className="text-gray-600">Manage roles and their permissions</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              className="bg-blue-600"
            >
              Create Role
            </Button>
          </div>

          <Table
            columns={roleColumns}
            dataSource={rolePermissions}
            rowKey="id"
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: "matrix",
      label: (
        <span className="flex items-center gap-2">
          <SecurityScanOutlined />
          Permission Matrix
        </span>
      ),
      children: (
        <div>
          <Alert
            message="Permission Matrix Overview"
            description="View all roles and their permissions in a matrix format for easy comparison."
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
                    {rolePermissions.map(role => (
                      <th key={role.id} className="text-center p-3 font-medium min-w-32">
                        {role.roleName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionCategories.map(category => (
                    <React.Fragment key={category.key}>
                      <tr className="bg-gray-50">
                        <td colSpan={rolePermissions.length + 1} className="p-3 font-semibold text-gray-700">
                          {category.title}
                        </td>
                      </tr>
                      {category.children.map(permission => (
                        <tr key={permission.key} className="border-b">
                          <td className="p-3 text-gray-700">{permission.title}</td>
                          {rolePermissions.map(role => (
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
            Department Permissions
          </h1>
          <p className="text-gray-600">Manage roles and access controls for your department</p>
        </div>
        <div className="flex items-center">
          <Image
            src="/signatures-illustration.svg"
            alt="Permissions Management"
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

      <Modal
        title={editingRole ? "Edit Role" : "Create New Role"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingRole ? "Update" : "Create"}
        okButtonProps={{ className: "bg-blue-600" }}
        width={800}
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

          <Divider>Permissions</Divider>

          {permissionCategories.map(category => (
            <div key={category.key} className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">{category.title}</h4>
              <div className="grid grid-cols-2 gap-4">
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
    </>
  );
};

export default DepartmentPermissionsPage;