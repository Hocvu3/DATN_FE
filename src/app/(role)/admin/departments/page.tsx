"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button, 
  Tag,
  Avatar,
  Tooltip,
  Modal,
  Input,
  Spin,
  Alert,
  App,
} from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import CreateDepartmentModal from "@/components/departments/CreateDepartmentModal";
import EditDepartmentModal from "@/components/departments/EditDepartmentModal";
import AddMemberModal from "@/components/departments/AddMemberModal";
import AddDocumentModal from "@/components/departments/AddDocumentModal";
import { DepartmentsApi } from "@/lib/departments-api";

const DepartmentsPage = () => {
  const { message: msg, modal } = App.useApp();

  // State management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized empty arrays to prevent unnecessary re-renders
  const emptyMemberIds = useMemo(() => [], []);
  const emptyDocumentIds = useMemo(() => [], []);

  // Fetch departments function
  const fetchDepartments = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await DepartmentsApi.getAll(search || undefined);
      if (result.data.success && result.data.data) {
        setDepartments(result.data.data.departments || []);
      } else {
        setError(result.data.message || "Failed to fetch departments");
        setDepartments([]); // Set empty array on error
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "An error occurred while fetching departments";
      setError(errorMessage);
      setDepartments([]); // Set empty array on error
      console.error("Fetch departments error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch departments on mount only
  useEffect(() => {
    fetchDepartments();
  }, []); // Only run once on mount

  // Debounced search effect
  useEffect(() => {
    if (searchQuery === "") {
      // If search is cleared, fetch immediately
      fetchDepartments();
      return;
    }

    // Debounce search for 500ms
    const timeoutId = setTimeout(() => {
      fetchDepartments(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchDepartments]);

  // Event handlers
  const handleCreateDepartment = async (departmentData: any) => {
    try {
      const result = await DepartmentsApi.create(departmentData);
      if (result.data.success) {
        msg.success("Department created successfully!");
        setShowCreateModal(false);
        fetchDepartments(searchQuery || undefined); // Refresh with current search
      } else {
        msg.error(result.data.message || "Failed to create department");
      }
    } catch (err) {
      msg.error("An error occurred while creating department");
      console.error(err);
    }
  };

  const handleEditDepartment = async (departmentData: any) => {
    if (!selectedDepartment?.id) return;
    
    try {
      const result = await DepartmentsApi.update(selectedDepartment.id, departmentData);
      if (result.data.success) {
        msg.success("Department updated successfully!");
        setShowEditModal(false);
        setSelectedDepartment(null);
        fetchDepartments(searchQuery || undefined); // Refresh with current search
      } else {
        msg.error(result.data.message || "Failed to update department");
      }
    } catch (err) {
      msg.error("An error occurred while updating department");
      console.error(err);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    modal.confirm({
      title: "Delete Department",
      content: "Are you sure you want to delete this department? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await DepartmentsApi.delete(departmentId);
          if (result.data.success) {
            msg.success("Department deleted successfully!");
            fetchDepartments(searchQuery || undefined); // Refresh with current search
          } else {
            msg.error(result.data.message || "Failed to delete department");
          }
        } catch (err) {
          msg.error("An error occurred while deleting department");
          console.error(err);
        }
      },
    });
  };

  const handleAddMembers = (memberIds: string[]) => {
    setShowAddMemberModal(false);
    setSelectedDepartment(null);
    msg.success(`${memberIds.length} member(s) added to department!`);
    fetchDepartments(searchQuery || undefined); // Refresh to update member counts
  };

  const handleAddDocuments = (documentIds: string[]) => {
    setShowAddDocumentModal(false);
    setSelectedDepartment(null);
    msg.success(`${documentIds.length} document(s) added to department!`);
    fetchDepartments(searchQuery || undefined); // Refresh to update document counts
  };

  // Department table columns
  const departmentColumns = [
    {
      title: "Department",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="bg-blue-100 text-blue-600"
          >
            <AppstoreOutlined style={{ fontSize: 20 }} />
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            {record.code && <div className="text-sm text-gray-500">{record.code}</div>}
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div className="max-w-xs truncate text-gray-600">{text}</div>
      ),
    },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (count: number) => (
        <div className="flex items-center gap-1">
          <TeamOutlined style={{ fontSize: 16, color: '#9ca3af' }} />
          <span>{count || 0}</span>
        </div>
      ),
    },
    {
      title: "Documents",
      dataIndex: "documents", 
      key: "documents",
      render: (count: number) => (
        <div className="flex items-center gap-1">
          <FileTextOutlined style={{ fontSize: 16, color: '#9ca3af' }} />
          <span>{count || 0}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Edit Department">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => {
                setSelectedDepartment(record);
                setShowEditModal(true);
              }}
              className="text-blue-600 hover:text-blue-700"
            />
          </Tooltip>
          <Tooltip title="Add Members">
            <Button
              type="text"
              size="small"
              icon={<UserAddOutlined style={{ fontSize: 16 }} />}
              onClick={() => {
                console.log("[Department] Add Members clicked:", { id: record.id, name: record.name, record });
                setSelectedDepartment(record);
                setShowAddMemberModal(true);
              }}
              className="text-green-600 hover:text-green-700"
            />
          </Tooltip>
          <Tooltip title="Add Documents">
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined style={{ fontSize: 16 }} />}
              onClick={() => {
                console.log("[Department] Add Documents clicked:", { id: record.id, name: record.name, record });
                setSelectedDepartment(record);
                setShowAddDocumentModal(true);
              }}
              className="text-purple-600 hover:text-purple-700"
            />
          </Tooltip>
          <Tooltip title="Delete Department">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => handleDeleteDepartment(record.id)}
              className="text-red-600 hover:text-red-700"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600 mt-1">
              Manage departments, members, and department documents
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined style={{ fontSize: 20 }} />}
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600"
          >
            Create Department
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-sm">
        {/* Search Bar */}
        <div className="mb-4">
          <Input
            placeholder="Search departments by name or description..."
            prefix={<SearchOutlined style={{ fontSize: 16, color: '#9ca3af' }} />}
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className="max-w-md"
          />
        </div>

            {/* Error Alert */}
            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                className="mb-4"
              />
            )}

            {/* Table */}
            <Spin spinning={loading}>
              <Table
                columns={departmentColumns}
                dataSource={departments}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} departments`,
                }}
                className="custom-table"
              />
            </Spin>
      </Card>

      {/* Modals */}
      <CreateDepartmentModal
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        onSubmit={handleCreateDepartment}
      />

      <EditDepartmentModal
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedDepartment(null);
        }}
        onSubmit={handleEditDepartment}
        department={selectedDepartment}
      />

      <AddMemberModal
        open={showAddMemberModal}
        onCancel={() => {
          console.log("[Department] AddMemberModal closing");
          setShowAddMemberModal(false);
          setSelectedDepartment(null);
        }}
        onSubmit={handleAddMembers}
        departmentId={selectedDepartment?.id}
        departmentName={selectedDepartment?.name}
        existingMemberIds={emptyMemberIds}
      />

      <AddDocumentModal
        open={showAddDocumentModal}
        onCancel={() => {
          console.log("[Department] AddDocumentModal closing");
          setShowAddDocumentModal(false);
          setSelectedDepartment(null);
        }}
        onSubmit={handleAddDocuments}
        departmentId={selectedDepartment?.id}
        departmentName={selectedDepartment?.name}
        existingDocumentIds={emptyDocumentIds}
      />

      {/* Delete Confirmation Modal - Now using modal.confirm() instead */}
    </div>
  );
};

export default DepartmentsPage;