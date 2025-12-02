"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Modal, 
  Input, 
  Checkbox, 
  Button, 
  message, 
  List, 
  Tag, 
  Empty,
  Select,
  Space,
  Badge,
  Avatar,
  Tooltip
} from "antd";
import { 
  SearchOutlined, 
  FileTextOutlined, 
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

interface Document {
  id: string;
  title: string;
  description?: string;
  fileType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  status: "draft" | "pending_approval" | "approved" | "rejected" | "published";
  securityLevel: "public" | "internal" | "confidential" | "secret" | "top_secret";
  department: string;
  coverImage?: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface AddDocumentModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (selectedDocuments: string[]) => void;
  departmentName?: string;
  departmentId?: string;
  existingDocumentIds?: string[];
}

// Mock documents data
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
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200",
    owner: {
      id: "101",
      name: "Jennifer Morgan",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  },
  {
    id: "2",
    title: "Marketing Campaign Proposal",
    description: "Fall 2025 marketing campaign strategy and planning",
    fileType: "pptx",
    size: 3720000,
    createdAt: "2025-09-12T09:15:00Z",
    updatedAt: "2025-09-14T16:20:00Z",
    tags: ["marketing", "campaign", "planning"],
    status: "pending_approval",
    securityLevel: "internal",
    department: "Marketing",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200",
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
    title: "API Documentation v2.1",
    description: "Complete API documentation for developers",
    fileType: "pdf",
    size: 5200000,
    createdAt: "2025-09-08T11:20:00Z",
    updatedAt: "2025-09-12T15:30:00Z",
    tags: ["technical", "api", "development"],
    status: "published",
    securityLevel: "public",
    department: "IT",
    owner: {
      id: "104",
      name: "Alex Kumar",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
  },
  {
    id: "5",
    title: "Security Protocol Guidelines",
    description: "Company-wide security protocols and procedures",
    fileType: "docx",
    size: 980000,
    createdAt: "2025-09-05T14:15:00Z",
    updatedAt: "2025-09-11T10:45:00Z",
    tags: ["security", "protocol", "guidelines"],
    status: "approved",
    securityLevel: "secret",
    department: "Security",
    owner: {
      id: "105",
      name: "Rachel Williams",
      avatar: "https://i.pravatar.cc/150?img=6",
    },
  },
  {
    id: "6",
    title: "Product Roadmap 2026",
    description: "Strategic product development roadmap for next year",
    fileType: "pptx",
    size: 4100000,
    createdAt: "2025-09-01T16:00:00Z",
    updatedAt: "2025-09-13T12:20:00Z",
    tags: ["product", "roadmap", "strategy"],
    status: "draft",
    securityLevel: "confidential",
    department: "Product",
    owner: {
      id: "106",
      name: "Tom Anderson",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
  },
];

const getSecurityLevelColor = (level: string): string => {
  switch (level) {
    case "public": return "green";
    case "internal": return "blue";
    case "confidential": return "orange";
    case "secret": return "red";
    case "top_secret": return "purple";
    default: return "default";
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "published": return "green";
    case "approved": return "cyan";
    case "pending_approval": return "orange";
    case "draft": return "default";
    case "rejected": return "red";
    default: return "default";
  }
};

const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (fileType: string) => {
  const iconColor = fileType === "pdf" ? "#F40F02" : 
                   fileType === "docx" ? "#2B579A" : 
                   fileType === "xlsx" ? "#217346" : 
                   fileType === "pptx" ? "#D04423" : "#5A5A5A";
  return <FileTextOutlined style={{ color: iconColor, fontSize: "20px" }} />;
};

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  open,
  departmentId, // eslint-disable-line @typescript-eslint/no-unused-vars
  departmentName,
  onCancel,
  onSubmit,
  existingDocumentIds = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [securityFilter, setSecurityFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Use ref to track previous existingDocumentIds to avoid infinite loops
  const prevExistingDocumentIds = useRef<string[]>([]);

  // Initialize and filter documents
  useEffect(() => {
    // Update ref to track previous value
    prevExistingDocumentIds.current = existingDocumentIds;

    let filtered = MOCK_DOCUMENTS.filter(doc => !existingDocumentIds.includes(doc.id));

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc =>
          doc.title.toLowerCase().includes(term) ||
          (doc.description && doc.description.toLowerCase().includes(term)) ||
          doc.tags.some(tag => tag.toLowerCase().includes(term)) ||
          doc.owner.name.toLowerCase().includes(term) ||
          doc.department.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // Apply security level filter
    if (securityFilter !== "all") {
      filtered = filtered.filter(doc => doc.securityLevel === securityFilter);
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(doc => doc.department.toLowerCase() === departmentFilter.toLowerCase());
    }

    setFilteredDocuments(filtered);
  }, [searchTerm, statusFilter, securityFilter, departmentFilter, existingDocumentIds]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setSelectedDocumentIds([]);
      setSearchTerm("");
      setStatusFilter("all");
      setSecurityFilter("all");
      setDepartmentFilter("all");
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

  const handleDocumentSelect = (documentId: string, checked: boolean) => {
    setSelectedDocumentIds(prev => 
      checked 
        ? [...prev, documentId]
        : prev.filter(id => id !== documentId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedDocumentIds(checked ? filteredDocuments.map(doc => doc.id) : []);
  };

  const handleSave = async () => {
    if (selectedDocumentIds.length === 0) {
      message.warning("Please select at least one document to add");
      return;
    }

    try {
      setLoading(true);
      const selectedDocuments = MOCK_DOCUMENTS.filter(doc => selectedDocumentIds.includes(doc.id));
      onSubmit(selectedDocumentIds);
      
      message.success(`Successfully added ${selectedDocuments.length} document(s) to ${departmentName}`);
      setSelectedDocumentIds([]);
      setSearchTerm("");
    } catch (error) {
      message.error("Failed to add documents");
    } finally {
      setLoading(false);
    }
  };

  const selectedDocuments = MOCK_DOCUMENTS.filter(doc => selectedDocumentIds.includes(doc.id));

  return (
    <Modal
      title={`Add Documents to ${departmentName}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnHidden
    >
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <Search
            placeholder="Search documents by title, description, tags, owner, or department..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            loading={searchLoading}
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <div className="flex flex-wrap gap-3">
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Status</Option>
              <Option value="published">Published</Option>
              <Option value="approved">Approved</Option>
              <Option value="pending_approval">Pending Approval</Option>
              <Option value="draft">Draft</Option>
              <Option value="rejected">Rejected</Option>
            </Select>

            <Select
              placeholder="Filter by security"
              value={securityFilter}
              onChange={setSecurityFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Security</Option>
              <Option value="public">Public</Option>
              <Option value="internal">Internal</Option>
              <Option value="confidential">Confidential</Option>
              <Option value="secret">Secret</Option>
              <Option value="top_secret">Top Secret</Option>
            </Select>

            <Select
              placeholder="Filter by department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Departments</Option>
              <Option value="finance">Finance</Option>
              <Option value="marketing">Marketing</Option>
              <Option value="human resources">Human Resources</Option>
              <Option value="it">IT</Option>
              <Option value="security">Security</Option>
              <Option value="product">Product</Option>
            </Select>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedDocumentIds.length} document(s) selected
              {filteredDocuments.length > 0 && (
                <span className="ml-2">
                  | {filteredDocuments.length} available document(s)
                </span>
              )}
            </span>
            <Space>
              <Checkbox
                indeterminate={selectedDocumentIds.length > 0 && selectedDocumentIds.length < filteredDocuments.length}
                checked={filteredDocuments.length > 0 && selectedDocumentIds.length === filteredDocuments.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Select All
              </Checkbox>
            </Space>
          </div>
        </div>

        {/* Document List */}
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          {filteredDocuments.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={searchTerm ? "No documents found matching your search" : "No available documents"}
              className="py-8"
            />
          ) : (
            <List
              dataSource={filteredDocuments}
              renderItem={(document) => (
                <List.Item
                  key={document.id}
                  className="hover:bg-gray-50 px-4"
                  actions={[
                    <Tooltip title="Preview document" key="view">
                      <Button type="text" icon={<EyeOutlined />} size="small" />
                    </Tooltip>,
                    <Checkbox
                      key="select"
                      checked={selectedDocumentIds.includes(document.id)}
                      onChange={(e) => handleDocumentSelect(document.id, e.target.checked)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="flex items-center">
                        {getFileIcon(document.fileType)}
                      </div>
                    }
                    title={
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{document.title}</span>
                        <Tag color={getStatusColor(document.status)}>
                          {document.status.replace('_', ' ')}
                        </Tag>
                        <Tag color={getSecurityLevelColor(document.securityLevel)} icon={<SafetyCertificateOutlined />}>
                          {document.securityLevel}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="space-y-2 text-sm">
                        {document.description && (
                          <div className="text-gray-600">{document.description}</div>
                        )}
                        <div className="flex items-center space-x-4 text-gray-500">
                          <div className="flex items-center">
                            <UserOutlined className="mr-1" />
                            <Avatar src={document.owner.avatar} size="small" className="mr-1" />
                            {document.owner.name}
                          </div>
                          <div className="flex items-center">
                            <CalendarOutlined className="mr-1" />
                            {new Date(document.updatedAt).toLocaleDateString()}
                          </div>
                          <div>
                            <Badge color="blue" text={document.department} />
                          </div>
                          <div>
                            {formatFileSize(document.size)}
                          </div>
                        </div>
                        {document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {document.tags.slice(0, 3).map(tag => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                            {document.tags.length > 3 && (
                              <Tag>+{document.tags.length - 3}</Tag>
                            )}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        {/* Selected Documents Preview */}
        {selectedDocuments.length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Selected Documents ({selectedDocuments.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedDocuments.map(doc => (
                <Tag
                  key={doc.id}
                  color="green"
                  closable
                  onClose={() => handleDocumentSelect(doc.id, false)}
                  className="flex items-center"
                >
                  {getFileIcon(doc.fileType)}
                  <span className="ml-1">{doc.title}</span>
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
            disabled={selectedDocumentIds.length === 0}
            className="bg-blue-600 border-blue-600 hover:bg-blue-700"
          >
            Add {selectedDocumentIds.length} Document(s)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddDocumentModal;