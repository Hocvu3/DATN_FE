"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Modal, 
  Input, 
  Checkbox, 
  Button, 
  List, 
  Avatar, 
  Tag, 
  Empty,
  Spin,
  Select,
  Badge,
  App
} from "antd";
import { SearchOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { UsersApi } from "@/lib/users-api";

const { Search } = Input;
const { Option } = Select;

// Calculate user title based on years of service
const calculateTitle = (joinDate: string): string => {
  const now = new Date();
  const joined = new Date(joinDate);
  const yearsOfService = (now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  if (yearsOfService >= 5) return "Senior";
  if (yearsOfService >= 3) return "Mid-level";
  if (yearsOfService >= 1) return "Junior";
  return "Fresher";
};

// Get full name from user object
const getFullName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`;
};

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: { id: string; name: string; };
  isActive: boolean;
  createdAt: string;
}

interface AddMemberModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (selectedUsers: string[]) => void;
  departmentName?: string;
  departmentId?: string;
  existingMemberIds?: string[];
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  open,
  departmentName,
  departmentId,
  onCancel,
  onSubmit,
  existingMemberIds = [],
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  
  // Use ref to track previous existingMemberIds to avoid infinite loops
  const prevExistingMemberIds = useRef<string[]>([]);

  // Debug: Log departmentId when modal opens
  useEffect(() => {
    if (open) {
      console.log("[AddMemberModal] Modal opened with:", {
        departmentId,
        departmentName,
        departmentIdType: typeof departmentId,
        isValidUUID: departmentId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(departmentId)
      });
    }
  }, [open, departmentId, departmentName]);

  // Fetch all users when modal opens
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await UsersApi.getAll({
        limit: 1000, // Get all users
        isActive: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
      });
      
      if (result.data.success && result.data.data) {
        setAllUsers(result.data.data.users);
      }
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load users';
      message.error(errorMessage, 6);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = allUsers.filter(user => !existingMemberIds.includes(user.id));

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user =>
          getFullName(user).toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.department?.name && user.department.name.toLowerCase().includes(term))
      );
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      if (departmentFilter === "none") {
        filtered = filtered.filter(user => !user.department);
      } else {
        filtered = filtered.filter(user => user.department?.name === departmentFilter);
      }
    }

    // Sort by department name
    filtered.sort((a, b) => {
      const deptA = a.department?.name || "zzz"; // Put users without department at the end
      const deptB = b.department?.name || "zzz";
      return deptA.localeCompare(deptB);
    });

    setFilteredUsers(filtered);
  }, [searchTerm, departmentFilter, statusFilter, allUsers, existingMemberIds]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedUserIds([]);
      setSearchTerm("");
      setDepartmentFilter("all");
      setStatusFilter("active");
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
      message.warning("Please select at least one user to add", 5);
      return;
    }

    if (!departmentId) {
      message.error("Department ID is required", 5);
      return;
    }

    console.log("[AddMemberModal] Starting to add members:", {
      selectedUserIds,
      departmentId,
      departmentName
    });

    try {
      setLoading(true);
      
      // Update each user's department
      const updatePromises = selectedUserIds.map(userId => {
        console.log("[AddMemberModal] Updating user:", userId, "to department:", departmentId);
        return UsersApi.updateUser(userId, { departmentId });
      });
      
      const results = await Promise.all(updatePromises);
      console.log("[AddMemberModal] Update results:", results);
      
      message.success(`Successfully added ${selectedUserIds.length} member(s) to ${departmentName}`, 5);
      
      setSelectedUserIds([]);
      setSearchTerm("");
      onSubmit(selectedUserIds);
      onCancel();
    } catch (error: any) {
      console.error("[AddMemberModal] Failed to add members:", error);
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add members to department';
      message.error(errorMessage, 6);
    } finally {
      setLoading(false);
    }
  };

  const selectedUsers = allUsers.filter(user => selectedUserIds.includes(user.id));

  // Get unique departments for filter
  const uniqueDepartments = Array.from(new Set(allUsers.map(u => u.department?.name).filter(Boolean))) as string[];

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
            placeholder="Search users by name, email, or department..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            loading={searchLoading}
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-3">
            <Select
              placeholder="Filter by department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: 180 }}
            >
              <Option value="all">All Departments</Option>
              <Option value="none">No Department</Option>
              {uniqueDepartments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                if (open) fetchUsers();
              }}
              style={{ width: 130 }}
            >
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
                        <Avatar icon={<UserOutlined />} size="large" className="bg-blue-500" />
                      </div>
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{getFullName(user)}</span>
                        <div className="flex items-center space-x-2">
                          <Tag color={user.isActive ? "green" : "red"}>
                            {user.isActive ? "ACTIVE" : "INACTIVE"}
                          </Tag>
                          {user.department && (
                            <Tag color="blue">{user.department.name}</Tag>
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
                          <span className="text-sm text-gray-500">{calculateTitle(user.createdAt)}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
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
                  <Avatar size="small" className="mr-1 bg-green-500" icon={<UserOutlined />} />
                  {getFullName(user)}
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