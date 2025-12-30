'use client';

import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Input, Select, Typography, Modal, message, App, Avatar, Space } from 'antd';
import { SearchOutlined, UserOutlined, MailOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons';
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
}

export default function DepartmentMembersList() {
  const { modal } = App.useApp();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await DepartmentApi.getMembers(filters);
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
  }, [filters]);

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
    </div>
  );
}
