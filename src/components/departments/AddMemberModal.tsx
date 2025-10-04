"use client";

import React, { useState, useEffect, useRef } from "react";
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
  
  // Use ref to track previous existingMemberIds to avoid infinite loops
  const prevExistingMemberIds = useRef<string[]>([]);

  // Initialize and filter users
  useEffect(() => {
    // Update ref to track previous value
    prevExistingMemberIds.current = existingMemberIds;

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
      onSubmit(selectedUserIds);
      
      message.success(`Successfully added ${selectedUserIds.length} member(s) to ${departmentName}`);
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
      destroyOnHidden
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

            <div className="flex items-center ml-auto">
              <Checkbox
                indeterminate={selectedUserIds.length > 0 && selectedUserIds.length < filteredUsers.length}
                checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Select All ({filteredUsers.length})
              </Checkbox>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            Showing {filteredUsers.length} user(s)
            {searchTerm && ` for "${searchTerm}"`}
          </span>
          {selectedUserIds.length > 0 && (
            <Badge count={selectedUserIds.length} color="blue">
              <span className="text-blue-600 font-medium">Selected</span>
            </Badge>
          )}
        </div>

        {/* Users List */}
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          {searchLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  {searchTerm ? `No users found for "${searchTerm}"` : "No users available"}
                </span>
              }
              className="py-8"
            />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={filteredUsers}
              renderItem={(user) => (
                <List.Item
                  className={`px-4 hover:bg-gray-50 cursor-pointer ${
                    selectedUserIds.includes(user.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleUserSelect(user.id, !selectedUserIds.includes(user.id))}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedUserIds.includes(user.id)}
                          onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                        />
                        <Avatar src={user.avatar} icon={<UserOutlined />} size="large" />
                      </div>
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{user.name}</span>
                        <div className="flex items-center space-x-2">
                          <Tag color={user.status === "active" ? "green" : "red"}>
                            {user.status.toUpperCase()}
                          </Tag>
                          {user.department && (
                            <Tag color="blue">{user.department}</Tag>
                          )}
                        </div>
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="flex items-center text-gray-600">
                          <MailOutlined className="mr-2" />
                          {user.email}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{user.role}</span>
                          {user.phone && (
                            <div className="flex items-center text-gray-500 text-sm">
                              <PhoneOutlined className="mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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