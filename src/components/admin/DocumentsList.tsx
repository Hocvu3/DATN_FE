'use client';

import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Input, Select, Badge, Typography, Dropdown, Menu, Modal, message } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, ShareAltOutlined, MoreOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import { DocumentsApi, getDocumentCoverUrl } from '@/lib/documents-api';
import { Document, DocumentStatus, DocumentsQueryParams, SecurityLevel } from '@/lib/types/document.types';
import EditDocumentModal from '@/components/documents/EditDocumentModal';
import CreateDocumentModal from '@/components/documents/CreateDocumentModal';
import { useDocumentApproval } from "@/hooks/useDocumentApproval";
import { SignatureSelectionModal } from "@/components/documents/SignatureSelectionModal";
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const statusColors = {
  [DocumentStatus.DRAFT]: 'default',
  [DocumentStatus.PENDING_APPROVAL]: 'processing',
  [DocumentStatus.APPROVED]: 'success',
  [DocumentStatus.REJECTED]: 'error',
  [DocumentStatus.ARCHIVED]: 'warning',
};

const securityColors = {
  [SecurityLevel.PUBLIC]: 'blue',
  [SecurityLevel.INTERNAL]: 'green',
  [SecurityLevel.CONFIDENTIAL]: 'orange',
  [SecurityLevel.SECRET]: 'red',
  [SecurityLevel.TOP_SECRET]: 'purple',
};

export default function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState<DocumentsQueryParams>({
    page: 1,
    limit: 10,
  });

  // Initialize document approval hook
  const { 
    showApprovalFlow,
    signatureModalVisible,
    signatures,
    loadingSignatures,
    approving,
    selectedSignatureId,
    handleSelectSignature,
    handleApproveWithSignature,
    handleCancelSignatureSelection,
  } = useDocumentApproval({
    onSuccess: () => {
      fetchDocuments(); // Refresh documents list after approval
    },
  });

  // Reset filters and fetch fresh data on mount
  useEffect(() => {
    setFilters({
      page: 1,
      limit: 10,
    });
  }, []);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await DocumentsApi.getAll(filters);
      setDocuments(data.data.documents);
      setPagination({
        current: data.data.page,
        pageSize: data.data.limit,
        total: data.data.total,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDocuments();
  }, [filters, fetchDocuments]);

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
      page: 1, // Reset to first page
      search: value || undefined,
    });
  };

  const handleStatusFilter = (value: DocumentStatus | undefined) => {
    setFilters({
      ...filters,
      page: 1,
      status: value,
    });
  };

  const handleSecurityFilter = (value: SecurityLevel | undefined) => {
    setFilters({
      ...filters,
      page: 1,
      securityLevel: value,
    });
  };
  
  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setShowEditModal(true);
  };

    const handleEditSave = async (values: any) => {
    try {
      await DocumentsApi.updateDocument(editingDocument!.id, values);
      message.success('Document updated successfully');
      setShowEditModal(false);
      setEditingDocument(null);
      fetchDocuments(); // Refresh the list
    } catch (error) {
      message.error('Failed to update document');
    }
  };

  const handleCreateSave = async () => {
    // The document was already created in the modal, just refresh the list
    message.success('Document created successfully');
    setShowCreateModal(false);
    fetchDocuments(); // Refresh the list
  };

  const handleDelete = async (id: string) => {
    try {
      // Call the delete document API
      await DocumentsApi.deleteDocument(id);
      
      // Update the local state
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      message.success("Document deleted successfully!");
    } catch (error) {
      message.error("Failed to delete document");
    } finally {
      setConfirmDelete(null);
    }
  };
  
  const handleStatusChange = async (docId: string, newStatus: DocumentStatus) => {
    const document = documents.find(doc => doc.id === docId);
    if (!document) return;

    const latestVersion = document.versions?.find(v => v.isLatest) || document.versions?.[0];
    if (!latestVersion) {
      message.error('No version found for this document');
      return;
    }

    // If status is being changed to APPROVED, show signature selection modal
    if (newStatus === DocumentStatus.APPROVED) {
      showApprovalFlow(docId);
      return;
    }

    // For other status changes, update version status
    try {
      // Import VersionApi at the top of the file
      const { VersionApi } = await import('@/lib/version-api');
      await VersionApi.updateVersionStatus(docId, latestVersion.id, newStatus);
      
      // Update local state
      setDocuments(prev =>
        prev.map(doc => {
          if (doc.id === docId) {
            return {
              ...doc,
              versions: doc.versions?.map(v => 
                v.id === latestVersion.id 
                  ? { ...v, status: newStatus, updatedAt: new Date().toISOString() }
                  : v
              ),
              updatedAt: new Date().toISOString()
            };
          }
          return doc;
        })
      );
      message.success('Version status updated successfully!');
    } catch (error) {
      message.error('Failed to update version status');
    }
  };

  const columns = [
    {
      title: 'Cover',
      key: 'cover',
      render: (text: string, record: Document) => (
        <div className="w-16 h-16 relative overflow-hidden rounded-md">
          <Image
            src={getDocumentCoverUrl(record.cover)}
            alt={record.title}
            width={64}
            height={64}
            className="object-cover"
            unoptimized
          />
        </div>
      ),
    },
    {
      title: 'Document',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Document) => (
        <div>
          <div className="font-medium text-blue-600">
            <Link href={`/admin/documents/${record.id}`}>{text}</Link>
          </div>
          <div className="text-sm text-gray-500">{record.documentNumber}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: Document) => {
        // Get status from latest version
        const latestVersion = record.versions?.find(v => v.isLatest) || record.versions?.[0];
        const status = latestVersion?.status || DocumentStatus.DRAFT;
        
        return (
          <Dropdown
            overlay={
              <Menu onClick={({ key }) => handleStatusChange(record.id, key as DocumentStatus)}>
                {Object.values(DocumentStatus).map((value) => (
                  <Menu.Item key={value}>
                    <div className="flex items-center gap-2">
                      <Badge status={statusColors[value] as any} />
                      <span className="whitespace-nowrap">{value.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                  </Menu.Item>
                ))}
              </Menu>
            }
            trigger={['click']}
          >
            <div className="cursor-pointer flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded">
              <Badge status={statusColors[status] as any} />
              <span className="whitespace-nowrap">{status.replace(/_/g, ' ').toUpperCase()}</span>
              <DownOutlined className="text-xs text-gray-400" />
            </div>
          </Dropdown>
        );
      },
    },
    {
      title: 'Security',
      dataIndex: 'securityLevel',
      key: 'securityLevel',
      render: (level: SecurityLevel) => (
        <Tag color={securityColors[level]}>{level}</Tag>
      ),
    },
    {
      title: 'Department',
      key: 'department',
      render: (text: string, record: Document) => (
        <span>{record.department?.name || 'N/A'}</span>
      ),
    },
    {
      title: 'Creator',
      key: 'creator',
      render: (text: string, record: Document) => (
        <span>{`${record.creator.firstName} ${record.creator.lastName}`}</span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Tags',
      key: 'tags',
      render: (text: string, record: Document) => (
        <div className="flex flex-wrap gap-1">
          {record.tags.map(tag => (
            <Tag key={tag.id} color={tag.tag.color || undefined}>
              {tag.tag.name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: Document) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<EyeOutlined />}>
                <Link href={`/admin/documents/${record.id}`}>View Details</Link>
              </Menu.Item>
              <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
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
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Documents Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Document
        </Button>
      </div>

      <div className="bg-white p-4 mb-4 rounded-md shadow">
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            placeholder="Search documents"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          
          <Select 
            placeholder="Filter by status"
            style={{ width: 180 }}
            allowClear
            onChange={handleStatusFilter}
          >
            {Object.values(DocumentStatus).map(status => (
              <Option key={status} value={status}>{status}</Option>
            ))}
          </Select>
          
          <Select 
            placeholder="Filter by security"
            style={{ width: 180 }}
            allowClear
            onChange={handleSecurityFilter}
          >
            {Object.values(SecurityLevel).map(level => (
              <Option key={level} value={level}>{level}</Option>
            ))}
          </Select>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={documents}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} documents`,
        }}
        onChange={handleTableChange}
        className="bg-white rounded-md shadow"
      />

      {/* Edit Document Modal */}
      {editingDocument && (
        <EditDocumentModal
          open={showEditModal}
          document={{
            id: editingDocument.id,
            title: editingDocument.title,
            description: editingDocument.description || '',
            fileType: 'pdf', // Default file type
            size: 0, // Default size
            createdAt: editingDocument.createdAt,
            updatedAt: editingDocument.updatedAt,
            tags: editingDocument.tags.map(tag => tag.tag.id),
            // Get status from latest version instead of document.status
            status: (editingDocument.versions?.find(v => v.isLatest)?.status || DocumentStatus.DRAFT).toLowerCase() as any,
            securityLevel: editingDocument.securityLevel.toLowerCase() as any,
            department: editingDocument.departmentId || '',
            owner: {
              id: editingDocument.creatorId,
              name: `${editingDocument.creator.firstName} ${editingDocument.creator.lastName}`,
            },
          }}
          onSave={handleEditSave}
          onCancel={() => {
            setShowEditModal(false);
            setEditingDocument(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={!!confirmDelete}
        onOk={() => handleDelete(confirmDelete!)}
        onCancel={() => setConfirmDelete(null)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this document? This action cannot be undone.</p>
      </Modal>

      {/* Create Document Modal */}
      <CreateDocumentModal
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        onSave={handleCreateSave}
      />

      {/* Signature Approval Modal */}
      <SignatureSelectionModal
        visible={signatureModalVisible}
        signatures={signatures}
        loading={loadingSignatures}
        approving={approving}
        selectedSignatureId={selectedSignatureId}
        onSelect={handleSelectSignature}
        onApprove={handleApproveWithSignature}
        onCancel={handleCancelSignatureSelection}
      />
    </div>
  );
}