'use client';

import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Input, Select, Typography, Modal, message, App, Avatar, Space, Form, Tooltip, Tabs, List, Spin } from 'antd';
import { SearchOutlined, UserOutlined, MailOutlined, PlusOutlined, TeamOutlined, DeleteOutlined, ExclamationCircleOutlined, UserAddOutlined, LockOutlined } from '@ant-design/icons';
import { DepartmentApi } from '@/lib/department-api';

const { Title } = Typography;
const { Option } = Select;

interface Member {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  role?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
}

const ExistingUserSearch = ({ onClose, isOpen }: { onClose: () => void; isOpen: boolean }) => {
  const { message } = App.useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [departmentId, setDepartmentId] = useState<string | null>(null);

  // Fetch users function
  const fetchUsers = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const params: any = { limit: 10 };
      if (search) params.search = search;
      // Don't set departmentId to get all users for adding
      
      const res = await DepartmentApi.searchUsers(params);
      const responseData = (res.data as any)?.data || res.data;
      setUsers(responseData?.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSearchTerm(''); // Reset search term
    }
  }, [isOpen, fetchUsers]);

  useEffect(() => {
    // Fetch department ID
    const fetchDeptInfo = async () => {
      try {
        const res = await DepartmentApi.getDepartmentInfo();
        // Handle nested response: res.data.data.data
        const responseData = res.data as any;
        const deptData = responseData?.data?.data || responseData?.data || responseData;
        if (deptData?.id) {
          setDepartmentId(deptData.id);
        }
      } catch (e) {
        console.error("Failed to get department info", e);
      }
    };
    fetchDeptInfo();
  }, []);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    fetchUsers(value);
  };

  const handleAdd = async (userId: string) => {
    try {
      // If departmentId is not loaded yet, fetch it now
      let deptId = departmentId;
      if (!deptId) {
        const res = await DepartmentApi.getDepartmentInfo();
        // Handle nested response: res.data.data.data
        const responseData = res.data as any;
        const deptData = responseData?.data?.data || responseData?.data || responseData;
        deptId = deptData?.id;
        if (deptId) setDepartmentId(deptId);
      }
      
      if (!deptId) {
        message.error("Could not determine department. Please try again.");
        return;
      }
      
      await DepartmentApi.addExistingMember(userId, deptId);
      message.success("User added to department successfully");
      // Refetch the user list to update availability
      await fetchUsers(searchTerm);
    } catch (e: any) {
      // Show backend error message
      const errorMsg = e.response?.data?.message || "Failed to add user";
      message.error(errorMsg);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by name or email..."
          prefix={<SearchOutlined />}
          onChange={e => handleSearch(e.target.value)}
          allowClear
        />
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {loading ? <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div> : (
          <List
            itemLayout="horizontal"
            dataSource={users}
            renderItem={user => {
              // Check if user is already in current department
              const inCurrentDept = user.department?.id === departmentId;
              const hasOtherDept = user.department && !inCurrentDept;

              return (
                <List.Item
                  actions={[
                    <Button
                      key="add"
                      type="link"
                      icon={<UserAddOutlined />}
                      onClick={() => handleAdd(user.id)}
                      disabled={!!user.department} // Disable if already in ANY department
                    >
                      {inCurrentDept ? 'Joined' : hasOtherDept ? 'Unavailable' : 'Add'}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: user.department ? '#ccc' : '#87d068' }} icon={<UserOutlined />} />}
                    title={<span>{user.firstName} {user.lastName} <Tag>{user.username}</Tag></span>}
                    description={
                      <Space direction="vertical" size={0}>
                        <span>{user.email}</span>
                        {user.department && <Tag color="blue">{user.department.name}</Tag>}
                      </Space>
                    }
                  />
                </List.Item>
              )
            }}
          />
        )}
        {!loading && users.length === 0 && <div style={{ textAlign: 'center', color: '#999' }}>No users found</div>}
      </div>
    </div>
  );
};


export default function DepartmentMembersList() {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [currentDepartmentId, setCurrentDepartmentId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
    roleId: undefined as string | undefined,
  });

  // Fetch department ID on mount
  useEffect(() => {
    const fetchDeptId = async () => {
      try {
        const res = await DepartmentApi.getDepartmentInfo();
        const responseData = res.data as any;
        const deptData = responseData?.data?.data || responseData?.data || responseData;
        if (deptData?.id) {
          setCurrentDepartmentId(deptData.id);
        }
      } catch (error) {
        console.error('Failed to fetch department ID:', error);
      }
    };
    fetchDeptId();
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!currentDepartmentId) return; // Wait for department ID to be loaded
    
    setLoading(true);
    try {
      // Explicitly pass departmentId to filter by current department only
      const params = {
        ...filters,
        departmentId: currentDepartmentId,
      };
      
      const { data } = await DepartmentApi.getMembers(params);
      setMembers(data.data.users);
      setPagination({
        current: data.data.page,
        pageSize: data.data.limit,
        total: data.data.total,
      });
    } catch (error) {
      message.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [filters, currentDepartmentId]);

  useEffect(() => {
    fetchMembers();
  }, [filters, fetchMembers]);

  const handleTableChange = (pagination: any) => {
    setFilters({
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  const handleSearch = (value: string) => {
    setFilters({
      ...filters,
      page: 1,
      search: value || undefined,
    });
  };

  const handleStatusFilter = (value: boolean | undefined) => {
    setFilters({
      ...filters,
      page: 1,
      isActive: value,
    });
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      // Call the real API - backend will automatically assign manager's department and employee role
      await DepartmentApi.createMember({
        email: values.email,
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        isActive: true, // Default to active
      });
      
      message.success('Member created successfully');
      setIsModalOpen(false);
      form.resetFields();
      fetchMembers();
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.response?.data?.message || 'Failed to create member';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    modal.confirm({
      title: 'Remove Member from Department',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to remove ${name} from this department? They will no longer have access to department resources.`,
      okText: 'Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Remove user from department by setting departmentId to null
          await DepartmentApi.updateMember(id, { departmentId: null });
          message.success('Member removed from department successfully');
          fetchMembers();
        } catch (error: any) {
          const errorMsg = error?.response?.data?.message || 'Failed to remove member';
          message.error(errorMsg);
        }
      },
    });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, name: string) => {
    const action = currentStatus ? 'lock' : 'unlock';
    const actionText = currentStatus ? 'Lock' : 'Unlock';
    
    modal.confirm({
      title: `${actionText} User Account`,
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to ${action} ${name}'s account?`,
      okText: actionText,
      okType: currentStatus ? 'danger' : 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await DepartmentApi.updateMember(id, { isActive: !currentStatus });
          message.success(`User ${action}ed successfully`);
          fetchMembers();
        } catch (error: any) {
          const errorMsg = error?.response?.data?.message || `Failed to ${action} user`;
          message.error(errorMsg);
        }
      },
    });
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (text: string, record: Member) => (
        <Space>
          <Avatar style={{ backgroundColor: '#0369a1' }} icon={<UserOutlined />} />
          <div>
            <div className="font-medium">
              {`${record.firstName} ${record.lastName}`}
            </div>
            <div className="text-sm text-gray-500">{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined />
          <span>{email}</span>
        </Space>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (text: string, record: Member) => (
        <Tag color="blue">{record.role?.name || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (text: string, record: Member) => (
        <Space>
          <Tooltip title={record.isActive ? 'Lock account' : 'Unlock account'}>
            <Button
              type="text"
              icon={<LockOutlined />}
              onClick={() => handleToggleActive(record.id, record.isActive, `${record.firstName} ${record.lastName}`)}
              style={{ color: record.isActive ? '#faad14' : '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Remove from department">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id, `${record.firstName} ${record.lastName}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 500 }}>
              <TeamOutlined style={{ marginRight: 8 }} />
              Department Members
            </Title>
            <p style={{ color: "#64748b", marginTop: 4 }}>
              Manage your department team members
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Member
          </Button>
        </div>
      </div>

      <div style={{
        background: "white",
        padding: 16,
        marginBottom: 16,
        borderRadius: 4,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <Input
            placeholder="Search members by name or email"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            placeholder="Filter by status"
            style={{ width: 180 }}
            allowClear
            onChange={handleStatusFilter}
          >
            <Option value={true}>Active</Option>
            <Option value={false}>Inactive</Option>
          </Select>
        </div>
      </div>

      <div style={{
        background: "white",
        borderRadius: 4,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
        <Table
          columns={columns}
          dataSource={members}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} members`,
          }}
          onChange={handleTableChange}
          bordered={false}
        />
      </div>

      <Modal
        title="Add Member"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setActiveTabKey('1');
          form.resetFields();
          fetchMembers(); // Reload members list when modal closes
        }}
        footer={null}
        maskClosable={false}
        width={600}
      >
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          items={[
            {
              key: '1',
              label: 'Create New Member',
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  name="create_member_form"
                  onFinish={handleCreate}
                >
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[{ required: true, message: 'Please enter first name' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please enter last name' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: 'Please enter username' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: 'Please enter password' },
                      { min: 6, message: 'Password must be at least 6 characters' }
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      <Button type="primary" htmlType="submit" loading={submitting}>
                        Create Member
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: '2',
              label: 'Add Existing User',
              children: (
                <ExistingUserSearch onClose={() => {
                  setIsModalOpen(false);
                  fetchMembers();
                }} isOpen={isModalOpen && activeTabKey === '2'} />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}
