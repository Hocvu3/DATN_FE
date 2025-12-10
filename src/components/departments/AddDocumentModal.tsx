"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Modal, 
  Input, 
  Checkbox, 
  Button, 
  List, 
  Tag, 
  Empty,
  Select,
  Space,
  Badge,
  Tooltip,
  Spin,
  App
} from "antd";
import { 
  SearchOutlined, 
  FileTextOutlined, 
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import { DocumentsApi } from "@/lib/documents-api";
import type { Document } from "@/lib/types/document.types";

const { Search } = Input;
const { Option } = Select;

interface AddDocumentModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (selectedDocuments: string[]) => void;
  departmentName?: string;
  departmentId?: string;
  existingDocumentIds?: string[];
}

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

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  open,
  departmentId,
  departmentName,
  onCancel,
  onSubmit,
  existingDocumentIds = [],
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [securityFilter, setSecurityFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Use ref to track previous existingDocumentIds to avoid infinite loops
  const prevExistingDocumentIds = useRef<string[]>([]);

  // Debug: Log departmentId when modal opens
  useEffect(() => {
    if (open) {
      console.log("[AddDocumentModal] Modal opened with:", {
        departmentId,
        departmentName,
        departmentIdType: typeof departmentId,
        isValidUUID: departmentId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(departmentId)
      });
    }
  }, [open, departmentId, departmentName]);

  // Fetch documents when modal opens
  useEffect(() => {
    if (open) {
      fetchDocuments();
    }
  }, [open]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const result = await DocumentsApi.getAll({});
      if (result.data.success && result.data.data) {
        setAllDocuments(result.data.data.documents);
      }
    } catch (error: any) {
      console.error("Failed to fetch documents:", error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load documents';
      message.error(errorMessage, 6);
    } finally {
      setLoading(false);
    }
  };

  // Filter documents
  useEffect(() => {
    let filtered = allDocuments.filter(doc => !existingDocumentIds.includes(doc.id));

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc =>
          doc.title.toLowerCase().includes(term) ||
          (doc.description && doc.description.toLowerCase().includes(term)) ||
          (doc.tags && doc.tags.some((dt: any) => dt.tag?.name?.toLowerCase().includes(term))) ||
          (doc.creator && `${doc.creator.firstName} ${doc.creator.lastName}`.toLowerCase().includes(term)) ||
          (doc.department?.name && doc.department.name.toLowerCase().includes(term))
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
      if (departmentFilter === "none") {
        filtered = filtered.filter(doc => !doc.department);
      } else {
        filtered = filtered.filter(doc => doc.department?.name === departmentFilter);
      }
    }

    // Sort by department name
    filtered.sort((a, b) => {
      const deptA = a.department?.name || "zzz";
      const deptB = b.department?.name || "zzz";
      return deptA.localeCompare(deptB);
    });

    setFilteredDocuments(filtered);
  }, [searchTerm, statusFilter, securityFilter, departmentFilter, allDocuments, existingDocumentIds]);

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
      message.warning("Please select at least one document to add", 5);
      return;
    }

    if (!departmentId) {
      message.error("Department ID is required", 5);
      return;
    }

    console.log("[AddDocumentModal] Starting to add documents:", {
      selectedDocumentIds,
      departmentId,
      departmentName
    });

    try {
      setLoading(true);
      
      // Update each document's department
      const updatePromises = selectedDocumentIds.map(docId => {
        console.log("[AddDocumentModal] Updating document:", docId, "to department:", departmentId);
        return DocumentsApi.updateDocument(docId, { departmentId });
      });
      
      const results = await Promise.all(updatePromises);
      console.log("[AddDocumentModal] Update results:", results);
      
      message.success(`Successfully added ${selectedDocumentIds.length} document(s) to ${departmentName}`, 5);
      
      setSelectedDocumentIds([]);
      setSearchTerm("");
      onSubmit(selectedDocumentIds);
      onCancel();
    } catch (error: any) {
      console.error("[AddDocumentModal] Failed to add documents:", error);
      
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add documents to department';
      message.error(errorMessage, 6);
    } finally {
      setLoading(false);
    }
  };

  const selectedDocuments = allDocuments.filter(doc => selectedDocumentIds.includes(doc.id));

  // Get unique departments for filter
  const uniqueDepartments = Array.from(new Set(allDocuments.map(d => d.department?.name).filter(Boolean))) as string[];

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
              style={{ width: 180 }}
            >
              <Option value="all">All Departments</Option>
              <Option value="no-department">No Department</Option>
              {uniqueDepartments.sort().map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
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
                        <FileTextOutlined className="text-2xl text-blue-500" />
                      </div>
                    }
                    title={
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{document.title}</span>
                        <Tag color={getStatusColor(document.versions?.find(v => v.isLatest)?.status || DocumentStatus.DRAFT)}>
                          {(document.versions?.find(v => v.isLatest)?.status || DocumentStatus.DRAFT).replace('_', ' ')}
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
                            {document.creator?.firstName} {document.creator?.lastName}
                          </div>
                          <div className="flex items-center">
                            <CalendarOutlined className="mr-1" />
                            {document.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          {document.department?.name && (
                            <div>
                              <Badge color="blue" text={document.department.name} />
                            </div>
                          )}
                        </div>
                        {document.tags && document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {document.tags.slice(0, 3).map((dt: any) => (
                              <Tag key={dt.id}>{dt.tag?.name || 'N/A'}</Tag>
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
                  <FileTextOutlined className="mr-1" />
                  <span>{doc.title}</span>
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