'use client';

import { useEffect, useState, useCallback } from 'react';
import { Table, Tag, Button, Input, Select, Typography, Dropdown, Modal, message, App } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { EmployeeApi } from '@/lib/employee-api';
import { getDocumentCoverUrl } from '@/lib/documents-api';
import { Document, DocumentStatus, DocumentsQueryParams, SecurityLevel } from '@/lib/types/document.types';
import EditDocumentModal from '@/components/documents/EditDocumentModal';
import CreateDocumentModal from '@/components/documents/CreateDocumentModal';
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

export default function EmployeeDocumentsList() {
  const { modal } = App.useApp();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState<DocumentsQueryParams>({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    setFilters({
      page: 1,
      limit: 10,
    });
  }, []);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await EmployeeApi.getDocuments(filters);
      setDocuments(data.data.documents);
      setPagination({
        current: data.data.page,
        pageSize: data.data.limit,
        total: data.data.total,
      });
    } catch (error) {
      message.error('Failed to fetch documents');
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
      page: 1,
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
      await EmployeeApi.updateDocument(editingDocument!.id, values);
      message.success('Document updated successfully');
      setShowEditModal(false);
      setEditingDocument(null);
      fetchDocuments();
    } catch (error) {
      message.error('Failed to update document');
    }
  };

  const handleCreateSave = async () => {
    message.success('Document created successfully');
    setShowCreateModal(false);
    fetchDocuments();
  };

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: 'Delete Document',
      content: 'Are you sure you want to delete this document?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await EmployeeApi.deleteDocument(id);
          setDocuments(prev => prev.filter(doc => doc.id !== id));
          message.success("Document deleted successfully!");
        } catch (error) {
          message.error("Failed to delete document");
        }
      },
    });
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
          <div className="font-medium text-emerald-600">
            <Link href={`/employee/documents/${record.id}`}>{text}</Link>
          </div>
          <div className="text-sm text-gray-500">{record.documentNumber}</div>
        </div>
      ),
    },
    {
      title: 'Versions',
      key: 'versions',
      render: (_: any, record: Document) => {
        const versionCount = record.versions?.length || 0;
        const latestVersion = record.versions?.find(v => v.isLatest) || record.versions?.[0];
        
        return (
          <div>
            <div className="font-medium">{versionCount} version{versionCount !== 1 ? 's' : ''}</div>
            {latestVersion && (
              <div className="text-xs text-gray-500">
                Latest: v{latestVersion.versionNumber} ({dayjs(latestVersion.createdAt).format('MMM DD')})
              </div>
            )}
          </div>
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
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: <Link href={`/employee/documents/${record.id}`}>View Details</Link>,
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => handleEdit(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 500 }}>
              My Documents
            </Title>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Document
          </Button>
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

      <div style={{
        background: "white",
        borderRadius: 4,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
      }}>
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
          bordered={false}
        />
      </div>

      {editingDocument && (
        <EditDocumentModal
          open={showEditModal}
          document={{
            id: editingDocument.id,
            title: editingDocument.title,
            description: editingDocument.description || '',
            fileType: 'pdf',
            size: 0,
            createdAt: editingDocument.createdAt,
            updatedAt: editingDocument.updatedAt,
            tags: editingDocument.tags.map(tag => tag.tag.id),
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

      <CreateDocumentModal
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        onSave={handleCreateSave}
      />
    </div>
  );
}
