"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Table,
  Tag,
  Input,
  Dropdown,
  Menu,
  Modal,
  Form,
  Upload,
  Select,
  DatePicker,
  Empty,
  message,
  Badge,
  Card,
  Tooltip,
  Tabs,
  Avatar,
} from "antd";
import Link from "next/link";
import {
  PlusOutlined,
  FileTextOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import CoverImageUpload from "@/components/documents/CoverImageUpload";
import DocumentGrid from "@/components/documents/DocumentGrid";
import EditDocumentModal from "@/components/documents/EditDocumentModal";
import { DocumentStatus, SecurityLevel } from "@/lib/types/document.types";
// Will be used when implementing real API calls
// import { DocumentsApi } from "@/lib/api";

const { Title, Text } = Typography;
const { Option } = Select;

// Interfaces
interface DocumentVersion {
  id: string;
  versionNumber: number;
  status: string;
  isLatest: boolean;
}

interface Document {
  id: string;
  title: string;
  description?: string;
  fileType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  status?: "draft" | "pending_approval" | "approved" | "rejected" | "published";
  versions?: DocumentVersion[];
  securityLevel: "public" | "internal" | "confidential" | "secret" | "top_secret";
  department: string;
  coverImage?: string;
  cover?: {
    id: string;
    s3Url: string;
    filename: string;
  } | null;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface FilterParams {
  keyword: string;
  status: string[];
  department: string;
  tag: string[];
  dateRange: [string, string] | null;
  sortBy: string;
  sortOrder: "ascend" | "descend";
}

// Mock data
const MOCK_DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "Q3 Financial Report 2025",
    description: "Quarterly financial performance report for Q3 2025",
    fileType: "pdf",
    size: 2450000,
    createdAt: "2025-09-15T10:30:00Z",
    updatedAt: "2025-09-15T14:45:00Z",
    tags: ["financial", "quarterly", "confidential"],
    status: "approved",
    securityLevel: "confidential",
    department: "Finance",
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&crop=top",
    owner: {
      id: "101",
      name: "Jennifer Morgan",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  },
  {
    id: "2",
    title: "Marketing Campaign Proposal",
    description: "Fall 2025 marketing campaign strategy and budget",
    fileType: "pptx",
    size: 3720000,
    createdAt: "2025-09-12T09:15:00Z",
    updatedAt: "2025-09-14T16:20:00Z",
    tags: ["marketing", "campaign", "budget"],
    status: "pending_approval",
    securityLevel: "internal",
    department: "Marketing",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center",
    owner: {
      id: "102",
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  },
  {
    id: "3",
    title: "Employee Handbook 2025",
    description: "Updated employee handbook with new policies",
    fileType: "docx",
    size: 1850000,
    createdAt: "2025-09-10T13:45:00Z",
    updatedAt: "2025-09-10T13:45:00Z",
    tags: ["hr", "policy", "internal"],
    status: "published",
    securityLevel: "internal",
    department: "Human Resources",
    owner: {
      id: "103",
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  },
  {
    id: "4",
    title: "System Architecture Documentation",
    description: "Technical documentation for the new system architecture",
    fileType: "pdf",
    size: 5240000,
    createdAt: "2025-09-08T11:20:00Z",
    updatedAt: "2025-09-09T17:15:00Z",
    tags: ["technical", "architecture", "documentation"],
    status: "draft",
    securityLevel: "confidential",
    department: "Information Technology",
    owner: {
      id: "104",
      name: "David Wilson",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
  },
];

// Sample departments
const DEPARTMENTS = [
  { value: "all", label: "All Departments" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "human-resources", label: "Human Resources" },
  { value: "information-technology", label: "Information Technology" },
  { value: "legal", label: "Legal" },
  { value: "product-management", label: "Product Management" },
  { value: "customer-success", label: "Customer Success" },
];

// Sample tags
const AVAILABLE_TAGS = [
  "financial",
  "quarterly",
  "marketing",
  "campaign",
  "hr",
  "policy",
  "technical",
  "architecture",
  "legal",
  "contract",
  "product",
  "roadmap",
  "customer",
  "survey",
  "security",
  "protocol",
  "confidential",
  "internal",
  "draft",
  "template",
  "strategy",
  "analysis",
  "documentation",
  "budget",
];

const getSecurityLevelColor = (level: string): string => {
  switch (level) {
    case "public":
      return "green";
    case "internal":
      return "blue";
    case "confidential":
      return "orange";
    case "secret":
      return "red";
    case "top_secret":
      return "purple";
    default:
      return "default";
  }
};

const getSecurityLevelLabel = (level: string): string => {
  switch (level) {
    case "public":
      return "Public";
    case "internal":
      return "Internal";
    case "confidential":
      return "Confidential";
    case "secret":
      return "Secret";
    case "top_secret":
      return "Top Secret";
    default:
      return level;
  }
};

const getFileIcon = (fileType: string) => {
  const iconColor =
    fileType === "pdf"
      ? "#F40F02"
      : fileType === "docx"
      ? "#2B579A"
      : fileType === "xlsx"
      ? "#217346"
      : fileType === "pptx"
      ? "#D04423"
      : "#5A5A5A";

  return <FileTextOutlined style={{ color: iconColor, fontSize: "18px" }} />;
};

// Convert local Document type to DocumentForEdit
const convertDocumentForEdit = (doc: Document | null): any => {
  if (!doc) return null;
  
  // Map string status to enum values
  const statusMap: Record<string, DocumentStatus> = {
    'draft': DocumentStatus.DRAFT,
    'pending_approval': DocumentStatus.PENDING_APPROVAL,
    'approved': DocumentStatus.APPROVED,
    'rejected': DocumentStatus.REJECTED,
    'published': DocumentStatus.APPROVED // Map published to approved
  };

  // Map string security level to enum values
  const securityMap: Record<string, SecurityLevel> = {
    'public': SecurityLevel.PUBLIC,
    'internal': SecurityLevel.INTERNAL,
    'confidential': SecurityLevel.CONFIDENTIAL,
    'secret': SecurityLevel.SECRET,
    'top_secret': SecurityLevel.TOP_SECRET
  };

  return {
    ...doc,
    status: statusMap[doc.status || 'draft'] || DocumentStatus.DRAFT,
    securityLevel: securityMap[doc.securityLevel] || SecurityLevel.INTERNAL
  };
};

export default function EmployeeDocumentsPage() {
  // States
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [uploadForm] = Form.useForm();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [filters, setFilters] = useState<FilterParams>({
    keyword: "",
    status: [],
    department: "all",
    tag: [],
    dateRange: null,
    sortBy: "updatedAt",
    sortOrder: "descend",
  });
  const [activeTab, setActiveTab] = useState("all");

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // For development using mock data
        setTimeout(() => {
          let filteredDocs = [...MOCK_DOCUMENTS];

          // Filter by tab
          if (activeTab !== "all") {
            if (activeTab === "owned") {
              filteredDocs = filteredDocs.filter(
                (doc) => doc.owner.id === "101"
              ); // Current user mock ID
            } else if (activeTab === "shared") {
              filteredDocs = filteredDocs.filter((doc) =>
                ["1", "3"].includes(doc.id)
              );
            } else if (activeTab === "recent") {
              filteredDocs.sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              );
              filteredDocs = filteredDocs.slice(0, 5);
            }
          }

          // Apply filters
          if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            filteredDocs = filteredDocs.filter(
              (doc) =>
                doc.title.toLowerCase().includes(keyword) ||
                (doc.description &&
                  doc.description.toLowerCase().includes(keyword)) ||
                doc.tags.some((tag) => tag.toLowerCase().includes(keyword))
            );
          }

          if (filters.status && filters.status.length > 0) {
            filteredDocs = filteredDocs.filter((doc) =>
              filters.status.includes(doc.status || 'draft')
            );
          }

          if (filters.department && filters.department !== "all") {
            filteredDocs = filteredDocs.filter(
              (doc) => doc.department.toLowerCase() === filters.department
            );
          }

          if (filters.tag && filters.tag.length > 0) {
            filteredDocs = filteredDocs.filter((doc) =>
              doc.tags.some((tag) => filters.tag.includes(tag))
            );
          }

          // Apply sorting
          filteredDocs.sort((a, b) => {
            const field = filters.sortBy;

            if (field === "title") {
              return filters.sortOrder === "ascend"
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
            }

            if (field === "createdAt" || field === "updatedAt") {
              return filters.sortOrder === "ascend"
                ? new Date(a[field]).getTime() - new Date(b[field]).getTime()
                : new Date(b[field]).getTime() - new Date(a[field]).getTime();
            }

            return 0;
          });

          setTotal(filteredDocs.length);
          setDocuments(filteredDocs);
          setLoading(false);
        }, 600);
      } catch (error) {
        message.error("Failed to load documents");
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [filters, activeTab]);

  // Handle search input
  const handleSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      keyword: value,
    }));
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle document upload
  const handleUpload = async (values: any) => {
    try {
      message.success("Document uploaded successfully!");
      setShowUploadModal(false);
      uploadForm.resetFields();

      // Refresh document list
      setDocuments((prev) => [
        {
          id: Date.now().toString(),
          title: values.title,
          description: values.description,
          fileType: values.file?.file?.name.split(".").pop() || "pdf",
          size: values.file?.file?.size || 1000000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: values.tags || [],
          status: "draft",
          securityLevel: values.securityLevel || "internal",
          department: "Information Technology",
          owner: {
            id: "101",
            name: "John Smith",
            avatar: "https://i.pravatar.cc/150?img=12",
          },
        },
        ...prev,
      ]);
    } catch (error) {
      message.error("Failed to upload document");
    }
  };

  // Handle document delete
  const handleDelete = async (id: string) => {
    try {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      message.success("Document deleted successfully!");
    } catch (error) {
      message.error("Failed to delete document");
    } finally {
      setConfirmDelete(null);
    }
  };

  // Handle edit document
  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setShowEditModal(true);
  };

  // Handle save edit
  const handleSaveEdit = async (values: any) => {
    try {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === values.id
            ? {
                ...doc,
                ...values,
                updatedAt: new Date().toISOString(),
              }
            : doc
        )
      );
      message.success("Document updated successfully!");
      setShowEditModal(false);
      setEditingDocument(null);
    } catch (error) {
      message.error("Failed to update document");
    }
  };

  // Table columns
  const columns = [
    {
      title: "Document",
      key: "document",
      render: (text: any, record: Document) => (
        <div className="flex items-start">
          <div className="mr-3 mt-1">{getFileIcon(record.fileType)}</div>
          <div>
            <Text strong className="text-gray-900 hover:text-primary-600">
              <Link href={`/employee/documents/${record.id}`}>{record.title}</Link>
            </Text>
            {record.description && (
              <div className="text-gray-500 text-sm mt-1">
                {record.description}
              </div>
            )}
            <div className="mt-2">
              {record.tags.slice(0, 3).map((tag) => (
                <Tag
                  key={tag}
                  className="mr-1 mb-1"
                  onClick={() => handleFilterChange("tag", [tag])}
                >
                  {tag}
                </Tag>
              ))}
              {record.tags.length > 3 && (
                <Tag className="mr-1 mb-1">+{record.tags.length - 3}</Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 150,
    },
    {
      title: "Owner",
      key: "owner",
      width: 150,
      render: (text: any, record: Document) => (
        <div className="flex items-center">
          <Avatar src={record.owner.avatar} size="small" className="mr-2" />
          <Text>{record.owner.name}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "draft": return "default";
            case "pending_approval": return "processing";
            case "approved": return "success";
            case "rejected": return "error";
            case "published": return "processing";
            default: return "default";
          }
        };
        
        const getStatusLabel = (status: string) => {
          switch (status) {
            case "draft": return "Draft";
            case "pending_approval": return "Pending Approval";
            case "approved": return "Approved";
            case "rejected": return "Rejected";
            case "published": return "Published";
            default: return status;
          }
        };

        return (
          <Badge
            status={getStatusColor(status) as any}
            text={getStatusLabel(status)}
          />
        );
      },
    },
    {
      title: "Security Level",
      dataIndex: "securityLevel",
      key: "securityLevel",
      width: 150,
      render: (securityLevel: string) => (
        <Tag color={getSecurityLevelColor(securityLevel)}>
          {getSecurityLevelLabel(securityLevel)}
        </Tag>
      ),
    },
    {
      title: "Last Modified",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          {new Date(date).toLocaleDateString()}
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (text: any, record: Document) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<EyeOutlined />}>
                <Link href={`/employee/documents/${record.id}`}>View</Link>
              </Menu.Item>
              <Menu.Item 
                key="edit" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Edit
              </Menu.Item>
              <Menu.Item key="download" icon={<DownloadOutlined />}>
                Download
              </Menu.Item>
              <Menu.Item key="share" icon={<ShareAltOutlined />}>
                Share
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => setConfirmDelete(record.id)}
              >
                Delete
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <Title level={3} className="!text-gray-800 !mb-1">
            Documents
          </Title>
          <Text className="text-gray-600">Manage your documents and files</Text>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowUploadModal(true)}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="mb-6"
        items={[
          {
            key: "all",
            label: "All Documents",
          },
          {
            key: "owned",
            label: "My Documents",
          },
          {
            key: "shared",
            label: "Shared with Me",
          },
          {
            key: "recent",
            label: "Recent",
          },
        ]}
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Text strong className="block mb-2">
              Search
            </Text>
            <Input
              placeholder="Search documents..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={filters.keyword}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              className="w-full"
            />
          </div>

          <div className="w-full md:w-48">
            <Text strong className="block mb-2">
              Status
            </Text>
            <Select
              mode="multiple"
              placeholder="All Statuses"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              className="w-full"
              maxTagCount="responsive"
            >
              <Option value="draft">Draft</Option>
              <Option value="pending_approval">Pending Approval</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="published">Published</Option>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <Text strong className="block mb-2">
              Department
            </Text>
            <Select
              placeholder="All Departments"
              value={filters.department}
              onChange={(value) => handleFilterChange("department", value)}
              className="w-full"
            >
              {DEPARTMENTS.map((dept) => (
                <Option key={dept.value} value={dept.value}>
                  {dept.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="w-full md:w-48">
            <Text strong className="block mb-2">
              Sort By
            </Text>
            <Select
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={(value) => {
                const [sortBy, sortOrder] = value.split("_");
                handleFilterChange("sortBy", sortBy);
                handleFilterChange("sortOrder", sortOrder);
              }}
              className="w-full"
            >
              <Option value="updatedAt_descend">Last Modified (Newest)</Option>
              <Option value="updatedAt_ascend">Last Modified (Oldest)</Option>
              <Option value="createdAt_descend">Date Created (Newest)</Option>
              <Option value="createdAt_ascend">Date Created (Oldest)</Option>
              <Option value="title_ascend">Title (A-Z)</Option>
              <Option value="title_descend">Title (Z-A)</Option>
            </Select>
          </div>
        </div>

        {/* Advanced filters */}
        <div className="mt-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-48">
            <Text strong className="block mb-2">
              Tags
            </Text>
            <Select
              mode="multiple"
              placeholder="Select Tags"
              value={filters.tag}
              onChange={(value) => handleFilterChange("tag", value)}
              className="w-full"
              maxTagCount="responsive"
            >
              {AVAILABLE_TAGS.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </div>

          <div className="w-full md:w-auto">
            <Text strong className="block mb-2">
              Date Range
            </Text>
            <DatePicker.RangePicker
              onChange={(dates, dateStrings) =>
                handleFilterChange(
                  "dateRange",
                  dateStrings[0] && dateStrings[1] ? dateStrings : null
                )
              }
            />
          </div>

          <div className="flex-1"></div>

          <div>
            <Button
              onClick={() => {
                setFilters({
                  keyword: "",
                  status: [],
                  department: "all",
                  tag: [],
                  dateRange: null,
                  sortBy: "updatedAt",
                  sortOrder: "descend",
                });
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Documents display */}
      <Card>
        <DocumentGrid
          documents={documents}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onEdit={handleEdit}
          onDelete={(id) => setConfirmDelete(id)}
          baseUrl="/employee/documents"
        />
        
        {/* Table view when grid is not selected */}
        {viewMode === "table" && (
          <div style={{ padding: 0, marginTop: 16 }}>
            <Table
              columns={columns}
              dataSource={documents}
              rowKey="id"
              loading={loading}
              pagination={{
                total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <span>
                        No documents found.{" "}
                        <Button
                          type="link"
                          onClick={() => setShowUploadModal(true)}
                        >
                          Upload a document
                        </Button>
                      </span>
                    }
                  />
                ),
              }}
            />
          </div>
        )}
      </Card>

      {/* Upload modal */}
      <Modal
        title="Upload Document"
        open={showUploadModal}
        onCancel={() => setShowUploadModal(false)}
        footer={null}
        width={800}
        className="upload-document-modal"
      >
        <Form form={uploadForm} layout="vertical" onFinish={handleUpload}>
          {/* Cover Image Section */}
          <Form.Item name="coverImage" className="mb-6">
            <CoverImageUpload />
          </Form.Item>

          {/* Document Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Form.Item
                name="title"
                label="Document Title"
                rules={[{ required: true, message: "Please enter a title" }]}
              >
                <Input 
                  placeholder="Enter document title" 
                  size="large"
                />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <Input.TextArea
                  placeholder="Enter document description (optional)"
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item name="tags" label="Tags">
                <Select
                  mode="tags"
                  placeholder="Add tags to help organize your document"
                  style={{ width: "100%" }}
                  size="large"
                  maxTagCount="responsive"
                >
                  {AVAILABLE_TAGS.map((tag) => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="space-y-4">
              <Form.Item
                name="file"
                label="Document File"
                rules={[{ required: true, message: "Please upload a file" }]}
              >
                <Upload.Dragger 
                  name="file" 
                  beforeUpload={() => false} 
                  maxCount={1}
                  className="hover:border-orange-400"
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined className="text-orange-500" />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for PDF, Word, Excel, PowerPoint files
                  </p>
                </Upload.Dragger>
              </Form.Item>

              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: "Please select a department" }]}
                initialValue="information-technology"
              >
                <Select size="large">
                  {DEPARTMENTS.filter((dept) => dept.value !== "all").map(
                    (dept) => (
                      <Option key={dept.value} value={dept.value}>
                        {dept.label}
                      </Option>
                    )
                  )}
                </Select>
              </Form.Item>

              {/* Security Level selection */}
              <Form.Item
                name="securityLevel"
                label="Security Level"
                initialValue="internal"
                rules={[{ required: true, message: "Please select security level" }]}
              >
                <Select size="large">
                  <Option value="public">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Public
                    </span>
                  </Option>
                  <Option value="internal">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Internal
                    </span>
                  </Option>
                  <Option value="confidential">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      Confidential
                    </span>
                  </Option>
                  <Option value="secret">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      Secret
                    </span>
                  </Option>
                  <Option value="top_secret">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Top Secret
                    </span>
                  </Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <Form.Item className="mb-0 mt-6">
            <div className="flex justify-end space-x-3">
              <Button 
                onClick={() => setShowUploadModal(false)}
                size="large"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                className="bg-orange-500 border-orange-500 hover:bg-orange-600"
              >
                Upload Document
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        title="Delete Document"
        open={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onOk={() => confirmDelete && handleDelete(confirmDelete)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete this document? This action cannot be
          undone.
        </p>
      </Modal>

      {/* Edit Document Modal */}
      <EditDocumentModal
        open={showEditModal}
        document={convertDocumentForEdit(editingDocument)}
        onCancel={() => {
          setShowEditModal(false);
          setEditingDocument(null);
        }}
        onSave={handleSaveEdit}
      />
    </>
  );
}