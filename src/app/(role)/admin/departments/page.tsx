"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  Table,
  Button, 
  Tag,
  Avatar,
  Tooltip,
  Modal,
  message,
  Tabs,
} from "antd";
import {
  Building,
  Users,
  FileText,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import CreateDepartmentModal from "@/components/departments/CreateDepartmentModal";
import EditDepartmentModal from "@/components/departments/EditDepartmentModal";
import AddMemberModal from "@/components/departments/AddMemberModal";
import AddDocumentModal from "@/components/departments/AddDocumentModal";

const DepartmentsPage = () => {
  // Mock data for departments with expanded fields
  const mockDepartments = [
    {
      id: "1",
      name: "Marketing",
      code: "MKT",
      description: "Responsible for brand promotion, advertising, and market analysis",
      managerId: "2",
      location: "floor2",
      status: "active",
      members: 8,
      documents: 32,
      icon: "/departments-illustration.svg",
      createdAt: "2023-01-15T10:00:00Z",
      updatedAt: "2025-09-30T14:30:00Z",
    },
    {
      id: "2", 
      name: "Finance",
      code: "FIN",
      description: "Financial planning, accounting, and financial operations",
      managerId: "1",
      location: "floor3",
      status: "active",
      members: 6,
      documents: 45,
      icon: "/departments-illustration.svg",
      createdAt: "2023-01-10T09:00:00Z",
      updatedAt: "2025-09-29T16:45:00Z",
    },
    {
      id: "3",
      name: "Human Resources", 
      code: "HR",
      description: "Employee management, recruitment, and organizational development",
      managerId: "4",
      location: "floor1",
      status: "active",
      members: 5,
      documents: 27,
      icon: "/departments-illustration.svg",
      createdAt: "2023-01-05T11:30:00Z",
      updatedAt: "2025-09-28T13:20:00Z",
    },
    {
      id: "4",
      name: "Information Technology",
      code: "IT", 
      description: "Software development, infrastructure, and technical support",
      managerId: "3",
      location: "floor4",
      status: "active",
      members: 12,
      documents: 54,
      icon: "/departments-illustration.svg",
      createdAt: "2023-01-01T08:00:00Z",
      updatedAt: "2025-09-30T11:15:00Z",
    },
    {
      id: "5",
      name: "Sales",
      code: "SLS",
      description: "Customer acquisition, relationship management, and revenue generation",
      managerId: "5",
      location: "floor2",
      status: "active",
      members: 10,
      documents: 38,
      icon: "/departments-illustration.svg",
      createdAt: "2023-01-20T14:00:00Z",
      updatedAt: "2025-09-27T09:30:00Z",
    },
  ];

  // State management
  const [activeTab, setActiveTab] = useState("departments");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [departments, setDepartments] = useState(mockDepartments);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Memoized empty arrays to prevent unnecessary re-renders
  const emptyMemberIds = useMemo(() => [], []);
  const emptyDocumentIds = useMemo(() => [], []);

  // Event handlers
  const handleCreateDepartment = (departmentData: any) => {
    const newDepartment = {
      ...departmentData,
      id: String(departments.length + 1),
      members: 0,
      documents: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDepartments([...departments, newDepartment]);
    setShowCreateModal(false);
    message.success("Department created successfully!");
  };

  const handleEditDepartment = (departmentData: any) => {
    setDepartments(
      departments.map((dept) =>
        dept.id === selectedDepartment?.id
          ? { ...dept, ...departmentData, updatedAt: new Date().toISOString() }
          : dept
      )
    );
    setShowEditModal(false);
    setSelectedDepartment(null);
    message.success("Department updated successfully!");
  };

  const handleDeleteDepartment = (departmentId: string) => {
    setDepartments(departments.filter((dept) => dept.id !== departmentId));
    setConfirmDelete(null);
    message.success("Department deleted successfully!");
  };

  const handleAddMembers = (memberIds: string[]) => {
    console.log("Adding members:", memberIds, "to department:", selectedDepartment?.id);
    setShowAddMemberModal(false);
    setSelectedDepartment(null);
    message.success(`${memberIds.length} members added to department!`);
  };

  const handleAddDocuments = (documentIds: string[]) => {
    console.log("Adding documents:", documentIds, "to department:", selectedDepartment?.id);
    setShowAddDocumentModal(false);
    setSelectedDepartment(null);
    message.success(`${documentIds.length} documents added to department!`);
  };

  // Tab items for the sub-navigation
  const tabItems = [
    {
      key: "departments",
      label: (
        <span className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Departments
        </span>
      ),
    },
    {
      key: "members",
      label: (
        <span className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Members
        </span>
      ),
    },
    {
      key: "documents",
      label: (
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents
        </span>
      ),
    },
  ];

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
            src={record.icon}
            className="bg-blue-100 text-blue-600"
          >
            <Building className="h-5 w-5" />
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.code}</div>
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
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (location: string) => (
        <Tag color="blue" className="capitalize">
          {location.replace('floor', 'Floor ')}
        </Tag>
      ),
    },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      render: (count: number) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{count}</span>
        </div>
      ),
    },
    {
      title: "Documents",
      dataIndex: "documents", 
      key: "documents",
      render: (count: number) => (
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-gray-400" />
          <span>{count}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"} className="capitalize">
          {status}
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
              icon={<Edit className="h-4 w-4" />}
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
              icon={<UserPlus className="h-4 w-4" />}
              onClick={() => {
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
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
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
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmDelete(record.id)}
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
            icon={<Plus className="h-5 w-5" />}
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600"
          >
            Create Department
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{departments.length}</div>
              <div className="text-sm text-gray-500">Total Departments</div>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {departments.reduce((sum, dept) => sum + dept.members, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Members</div>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {departments.reduce((sum, dept) => sum + dept.documents, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Documents</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Card className="border-0 shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="custom-tabs"
        />

        {/* Departments Tab Content */}
        {activeTab === "departments" && (
          <div className="mt-6">
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
          </div>
        )}

        {/* Members Tab Content - Placeholder */}
        {activeTab === "members" && (
          <div className="mt-6 text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Members Management</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              View and manage all department members. This feature is coming soon.
            </p>
          </div>
        )}

        {/* Documents Tab Content - Placeholder */}
        {activeTab === "documents" && (
          <div className="mt-6 text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Documents Management</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              View and manage all department documents. This feature is coming soon.
            </p>
          </div>
        )}
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
          setShowAddMemberModal(false);
          setSelectedDepartment(null);
        }}
        onSubmit={handleAddMembers}
        departmentName={selectedDepartment?.name}
        existingMemberIds={emptyMemberIds}
      />

      <AddDocumentModal
        open={showAddDocumentModal}
        onCancel={() => {
          setShowAddDocumentModal(false);
          setSelectedDepartment(null);
        }}
        onSubmit={handleAddDocuments}
        departmentName={selectedDepartment?.name}
        existingDocumentIds={emptyDocumentIds}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Department"
        open={!!confirmDelete}
        onOk={() => confirmDelete && handleDeleteDepartment(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              Are you sure you want to delete this department?
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              This action cannot be undone. All department data will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;