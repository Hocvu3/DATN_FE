"use client";

import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Input, 
  Checkbox, 
  Button, 
  message, 
  List, 
  Avatar, 
  Tag, 
  Empty,
  Spin,
  Select,
  Space,
  Badge
} from "antd";
import { SearchOutlined, UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
  phone?: string;
  status: "active" | "inactive";
  joinDate: string;
}

interface AddMemberModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (selectedUsers: string[]) => void;
  departmentName?: string;
  departmentId?: string;
  existingMemberIds?: string[];
}

// Mock users data
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    role: "Senior Developer",
    department: "IT",
    avatar: "https://i.pravatar.cc/150?img=1",
    phone: "+1-234-567-8901",
    status: "active",
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@company.com",
    role: "Marketing Manager",
    department: "Marketing",
    avatar: "https://i.pravatar.cc/150?img=2",
    phone: "+1-234-567-8902",
    status: "active",
    joinDate: "2022-11-20",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol.davis@company.com",
    role: "HR Specialist",
    department: "HR",
    avatar: "https://i.pravatar.cc/150?img=3",
    phone: "+1-234-567-8903",
    status: "active",
    joinDate: "2023-02-10",
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david.wilson@company.com",
    role: "Financial Analyst",
    department: "Finance",
    avatar: "https://i.pravatar.cc/150?img=4",
    phone: "+1-234-567-8904",
    status: "active",
    joinDate: "2022-12-05",
  },
  {
    id: "5",
    name: "Emma Brown",
    email: "emma.brown@company.com",
    role: "UX Designer",
    department: "Design",
    avatar: "https://i.pravatar.cc/150?img=5",
    phone: "+1-234-567-8905",
    status: "active",
    joinDate: "2023-03-25",
  },
];

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  open,
  departmentId,
  departmentName,
  onCancel,
  onSubmit,
  existingMemberIds = [],
}) => {

// Mock users data
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    role: "Senior Developer",
    department: "IT",
    avatar: "https://i.pravatar.cc/150?img=1",
    phone: "+1 (555) 123-4567",
    status: "active",
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@company.com",
    role: "Marketing Specialist",
    department: "Marketing",
    avatar: "https://i.pravatar.cc/150?img=2",
    phone: "+1 (555) 234-5678",
    status: "active",
    joinDate: "2023-02-20",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol.davis@company.com",
    role: "Financial Analyst",
    department: "Finance",
    avatar: "https://i.pravatar.cc/150?img=3",
    phone: "+1 (555) 345-6789",
    status: "active",
    joinDate: "2023-03-10",
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david.wilson@company.com",
    role: "HR Manager",
    department: "HR",
    avatar: "https://i.pravatar.cc/150?img=4",
    phone: "+1 (555) 456-7890",
    status: "active",
    joinDate: "2023-01-05",
  },
  {
    id: "5",
    name: "Eva Brown",
    email: "eva.brown@company.com",
    role: "Project Manager",
    avatar: "https://i.pravatar.cc/150?img=5",
    phone: "+1 (555) 567-8901",
    status: "active",
    joinDate: "2023-04-12",
  },
  {
    id: "6",
    name: "Frank Miller",
    email: "frank.miller@company.com",
    role: "Sales Representative",
    department: "Sales",
    avatar: "https://i.pravatar.cc/150?img=6",
    phone: "+1 (555) 678-9012",
    status: "inactive",
    joinDate: "2022-11-20",
  },
  {
    id: "7",
    name: "Grace Lee",
    email: "grace.lee@company.com",
    role: "UX Designer",
    department: "Design",
    avatar: "https://i.pravatar.cc/150?img=7",
    phone: "+1 (555) 789-0123",
    status: "active",
    joinDate: "2023-05-08",
  },
  {
    id: "8",
    name: "Henry Garcia",
    email: "henry.garcia@company.com",
    role: "DevOps Engineer",
    department: "IT",
    avatar: "https://i.pravatar.cc/150?img=8",
    phone: "+1 (555) 890-1234",
    status: "active",
    joinDate: "2023-03-25",
  },
];

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  open,
  departmentId,
  departmentName,
  onCancel,
  onSubmit,
  existingMemberIds = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Initialize and filter users
  useEffect(() => {
    let filtered = MOCK_USERS.filter(user => !existingMemberIds.includes(user.id));

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term) ||
          (user.department && user.department.toLowerCase().includes(term))
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role.toLowerCase().includes(roleFilter.toLowerCase()));
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, existingMemberIds]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedUserIds([]);
      setSearchTerm("");
      setRoleFilter("all");
      setStatusFilter("all");
    }
  }, [open]);

  const handleSearch = (value: string) => {
    setSearchLoading(true);
    setSearchTerm(value);
    
    // Simulate search delay
    setTimeout(() => {
      setSearchLoading(false);
    }, 300);
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    setSelectedUserIds(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedUserIds(checked ? filteredUsers.map(user => user.id) : []);
  };

  const handleSave = async () => {
    if (selectedUserIds.length === 0) {
      message.warning("Please select at least one user to add");
      return;
    }

    try {
      setLoading(true);
      const selectedUsers = MOCK_USERS.filter(user => selectedUserIds.includes(user.id));
      onSubmit(selectedUserIds);
      
      message.success(`Successfully added ${selectedUsers.length} member(s) to ${departmentName}`);
      setSelectedUserIds([]);
      setSearchTerm("");
    } catch (error) {
      console.error("Error adding members:", error);
      message.error("Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  const selectedUsers = MOCK_USERS.filter(user => selectedUserIds.includes(user.id));

  return (
    <Modal
      title={`Add Members to ${departmentName}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <Search
            placeholder="Search users by name, email, role, or department..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            loading={searchLoading}
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-3">
            <Select
              placeholder="Filter by role"
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Roles</Option>
              <Option value="developer">Developer</Option>
              <Option value="manager">Manager</Option>
              <Option value="analyst">Analyst</Option>
              <Option value="specialist">Specialist</Option>
              <Option value="designer">Designer</Option>
              <Option value="engineer">Engineer</Option>
            </Select>

            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 130 }}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedUserIds.length} user(s) selected
              {filteredUsers.length > 0 && (
                <span className="ml-2">
                  | {filteredUsers.length} available user(s)
                </span>
              )}
            </span>
            <Space>
              <Checkbox
                indeterminate={selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length}
                checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Select All
              </Checkbox>
            </Space>
          </div>
        </div>

        {/* User List */}
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          {filteredUsers.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={searchTerm ? "No users found matching your search" : "No available users"}
              className="py-8"
            />
          ) : (
            <List
              dataSource={filteredUsers}
              renderItem={(user) => (
                <List.Item
                  key={user.id}
                  className="hover:bg-gray-50 px-4"
                  actions={[
                    <Checkbox
                      key="select"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={user.status === 'active'} color={user.status === 'active' ? 'green' : 'red'}>
                        <Avatar src={user.avatar} icon={<UserOutlined />} size="large" />
                      </Badge>
                    }
                    title={
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{user.name}</span>
                        <Tag color={user.status === 'active' ? 'green' : 'red'}>
                          {user.status}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-gray-600">
                          <MailOutlined className="mr-2" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <UserOutlined className="mr-2" />
                          {user.role}
                          {user.department && (
                            <span className="ml-2 text-blue-600">• {user.department}</span>
                          )}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-gray-600">
                            <PhoneOutlined className="mr-2" />
                            {user.phone}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Joined: {new Date(user.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        {/* Selected Users Preview */}
        {selectedUsers.length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Selected Users ({selectedUsers.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <Tag
                  key={user.id}
                  color="green"
                  closable
                  onClose={() => handleUserSelect(user.id, false)}
                  className="flex items-center"
                >
                  <Avatar src={user.avatar} size="small" className="mr-1" />
                  {user.name}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            onClick={onCancel}
            size="large"
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleSave}
            loading={loading}
            size="large"
            disabled={selectedUserIds.length === 0}
            className="bg-blue-600 border-blue-600 hover:bg-blue-700"
          >
            Add {selectedUserIds.length} Member(s)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMemberModal;