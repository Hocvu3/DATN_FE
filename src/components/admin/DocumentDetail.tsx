'use client';

import { useEffect, useState, useCallback } from 'react';
import { Spin, Typography, Descriptions, Tag, Button, Card, Tabs, Divider, Space, Badge, List, Avatar, App, Modal, Upload, Input, Form, Dropdown, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, EditOutlined, LockOutlined, EyeOutlined, HistoryOutlined, DeleteOutlined, UploadOutlined, SendOutlined } from '@ant-design/icons';
import { Document, DocumentStatus, DocumentVersion, SecurityLevel } from '@/lib/types/document.types';
import { DocumentsApi, getDocumentCoverUrl } from '@/lib/documents-api';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import EditDocumentModal from '@/components/documents/EditDocumentModal';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

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

interface DocumentDetailProps {
  documentId: string;
}

export default function DocumentDetail({ documentId }: DocumentDetailProps) {
  const { message } = App.useApp();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [documentAssets, setDocumentAssets] = useState<any[]>([]);
  const [uploadingVersion, setUploadingVersion] = useState<boolean>(false);
  const [versionComment, setVersionComment] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [selectedVersionForView, setSelectedVersionForView] = useState<DocumentVersion | null>(null);

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await DocumentsApi.getById(documentId);
      if (data && data.data && data.data.document) {
        const documentData = data.data.document;
        setDocument(documentData);
        
        // Set assets directly from document response
        if (documentData.assets && documentData.assets.length > 0) {
          setDocumentAssets(documentData.assets);
        } else {
          setDocumentAssets([]);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  const handleEditSave = async (values: any) => {
    try {
      const { data } = await DocumentsApi.updateDocument(documentId, values);
      
      if (data && data.success) {
        message.success('Document updated successfully');
        // Refresh document data
        fetchDocument();
        setShowEditModal(false);
      } else {
        message.error('Failed to update document');
      }
    } catch (error) {
      message.error('Error updating document');
    }
  };

  // Handle download version
  const handleDownloadVersion = async (version: DocumentVersion) => {
    try {
      if (!version.s3Key) {
        message.error('Version does not have a valid S3 key');
        return;
      }

      const blob = await DocumentsApi.downloadFile(version.s3Key);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = `${document?.title || 'document'}-v${version.versionNumber}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      message.success('File downloaded successfully', 5);
    } catch (error) {
      message.error('Failed to download file: ' + (error instanceof Error ? error.message : 'Unknown error'), 6);
    }
  };

  // Handle download latest version
  const handleDownloadLatest = () => {
    if (!document?.versions || document.versions.length === 0) {
      message.warning('No document versions available for download');
      return;
    }
    const latestVersion = document.versions[document.versions.length - 1];
    handleDownloadVersion(latestVersion);
  };

  // Generate download menu items for versions
  const getDownloadMenuItems = (): MenuProps['items'] => {
    if (!document?.versions || document.versions.length === 0) return [];
    
    return document.versions.map((version, index) => ({
      key: version.id,
      label: (
        <div className="flex items-center justify-between">
          <span>Version {version.versionNumber}</span>
          {index === document.versions.length - 1 && (
            <Tag color="green" className="ml-2">Latest</Tag>
          )}
        </div>
      ),
      onClick: () => handleDownloadVersion(version),
    }));
  };

  // Handle view version selection
  const handleViewVersion = (version: DocumentVersion) => {
    setSelectedVersionForView(version);
    setViewModalVisible(true);
  };

  // Handle view latest version (default)
  const handleViewLatest = () => {
    if (!document?.versions || document.versions.length === 0) {
      message.warning('No document versions available for viewing');
      return;
    }
    const latestVersion = document.versions[document.versions.length - 1];
    handleViewVersion(latestVersion);
  };

  // Generate view menu items for versions
  const getViewMenuItems = (): MenuProps['items'] => {
    if (!document?.versions || document.versions.length === 0) return [];
    
    return document.versions.map((version, index) => ({
      key: version.id,
      label: (
        <div className="flex items-center justify-between">
          <span>Version {version.versionNumber}</span>
          {index === document.versions.length - 1 && (
            <Tag color="green" className="ml-2">Latest</Tag>
          )}
        </div>
      ),
      onClick: () => handleViewVersion(version),
    }));
  };

  // Handle asset deletion
  const handleDeleteAsset = async (assetId: string, filename: string) => {
    Modal.confirm({
      title: 'Delete Asset',
      content: `Are you sure you want to delete "${filename}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await DocumentsApi.deleteDocumentAsset(documentId, assetId);
          
          if (response.status >= 200 && response.status < 300) {
            message.success('Asset deleted successfully');
            // Refresh document data to update asset list
            fetchDocument();
          } else {
            message.error('Failed to delete asset');
          }
        } catch (error) {
          message.error('Failed to delete asset: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      },
    });
  };

  // Handle version upload
  const handleVersionUpload = async (file: File) => {
    if (!file) return false;
    
    try {
      setUploadingVersion(true);
      
      // Step 1: Get presigned URL
      const presignedResponse = await DocumentsApi.generateVersionPresignedUrl(
        documentId,
        file.name,
        file.type
      );
      
      // Backend response structure: { success, data: { presignedUrl, key, publicUrl, message }, ... }
      // Our API wrapper returns: { data: <backend response>, status }
      const backendResponse = presignedResponse.data as any;
      const presignedData = backendResponse.data || backendResponse;
      
      // Step 2: Upload to S3
      const uploadResponse = await fetch(presignedData.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }
      
      // Step 3: Create version record
      await DocumentsApi.createDocumentVersion(documentId, {
        s3Key: presignedData.key || '',
        s3Url: presignedData.publicUrl || '',
        fileSize: file.size,
        mimeType: file.type,
        checksum: '', // Empty string fallback
        // Don't send versionNumber - let backend auto-increment
      });
      
      message.success('New version uploaded successfully', 5);
      setVersionComment('');
      form.resetFields();
      fetchDocument(); // Refresh to show new version
    } catch (error) {
      message.error('Failed to upload version: ' + (error instanceof Error ? error.message : 'Unknown error'), 6);
    } finally {
      setUploadingVersion(false);
    }
    
    return false; // Prevent default upload
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      message.warning('Please enter a comment');
      return;
    }
    
    try {
      setSubmittingComment(true);
      await DocumentsApi.createDocumentComment(documentId, {
        content: commentText,
        isInternal: false,
      });
      
      message.success('Comment added successfully', 3);
      setCommentText('');
      fetchDocument(); // Refresh to show new comment
    } catch (error) {
      message.error('Failed to add comment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!document) {
    return (
      <div className="p-6">
        <Title level={4}>Document not found</Title>
        <Link href="/admin/documents">
          <Button type="primary" icon={<ArrowLeftOutlined />}>
            Back to Documents
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link href="/admin/documents">
            <Button icon={<ArrowLeftOutlined />} className="mb-2">
              Back to Documents
            </Button>
          </Link>
          <Title level={2}>{document.title}</Title>
          <div className="flex gap-2 mt-2">
            <Badge status={statusColors[document.status] as any} text={document.status} />
            <Tag color={securityColors[document.securityLevel]}>{document.securityLevel}</Tag>
            <Text type="secondary">#{document.documentNumber}</Text>
          </div>
        </div>

        <Space>
          <Dropdown
            menu={{ items: getViewMenuItems() }}
            trigger={['click']}
            disabled={!document?.versions || document.versions.length === 0}
          >
            <Button 
              icon={<EyeOutlined />}
              disabled={!document?.versions || document.versions.length === 0}
            >
              View
            </Button>
          </Dropdown>

          <Button 
            icon={<EditOutlined />} 
            type="primary"
            onClick={() => setShowEditModal(true)}
          >
            Edit Document
          </Button>
          
          <Dropdown
            menu={{ items: getDownloadMenuItems() }}
            trigger={['click']}
            disabled={!document?.versions || document.versions.length === 0}
          >
            <Button 
              icon={<DownloadOutlined />}
              disabled={!document?.versions || document.versions.length === 0}
            >
              Download
            </Button>
          </Dropdown>
        </Space>
      </div>

      <div className="flex gap-6">
        {/* Left Column */}
        <div className="w-2/3">
          <Card className="mb-6">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Details" key="details">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Document ID" span={2}>
                    {document.id}
                  </Descriptions.Item>
                  <Descriptions.Item label="Document Number" span={2}>
                    {document.documentNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Department" span={2}>
                    {document.department?.name || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Security Level" span={2}>
                    <Tag color={securityColors[document.securityLevel]}>{document.securityLevel}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status" span={2}>
                    <Badge status={statusColors[document.status] as any} text={document.status} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Created By" span={1}>
                    {document?.creator?.firstName} {document?.creator?.lastName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At" span={1}>
                    {dayjs(document.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Updated At" span={2}>
                    {dayjs(document.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <div>
                  <Title level={5}>Description</Title>
                  <Paragraph>{document.description || 'No description provided'}</Paragraph>
                </div>

                <Divider />

                <div>
                  <Title level={5}>Tags</Title>
                  <div className="flex flex-wrap gap-1">
                    {document.tags && document.tags.length > 0 
                      ? document.tags.map(tagDoc => (
                          <Tag key={tagDoc.tag.id} color={tagDoc.tag.color || undefined}>
                            {tagDoc.tag.name}
                          </Tag>
                        ))
                      : <Text type="secondary">No tags</Text>
                    }
                  </div>
                </div>
              </TabPane>

              <TabPane tab={<><HistoryOutlined /> Version History</>} key="versions">
                <div className="mb-4">
                  <Card size="small" title="Upload New Version">
                    <Form form={form} layout="vertical">
                      <Form.Item label="Version Comment (Optional)" name="comment">
                        <Input.TextArea
                          rows={3}
                          placeholder="Describe what changed in this version..."
                          value={versionComment}
                          onChange={(e) => setVersionComment(e.target.value)}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Upload
                          beforeUpload={handleVersionUpload}
                          showUploadList={false}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        >
                          <Button icon={<UploadOutlined />} loading={uploadingVersion} type="primary">
                            Upload New Version
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Form>
                  </Card>
                </div>
                
                <List
                  itemLayout="horizontal"
                  dataSource={document.versions || []}
                  locale={{ emptyText: 'No versions yet' }}
                  renderItem={(version: DocumentVersion) => (
                    <List.Item
                      actions={[
                        <Button key="view" icon={<EyeOutlined />} size="small">View</Button>,
                        <Button key="download" icon={<DownloadOutlined />} size="small">Download</Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={<>Version {version.versionNumber} {version.versionNumber === (document.versions?.length || 1) && <Tag color="green">Latest</Tag>}</>}
                        description={
                          <>
                            <div>Created on {dayjs(version.createdAt).format('YYYY-MM-DD HH:mm')}</div>
                            <div>{version.comment || 'No comment'}</div>
                            <div className="text-xs text-gray-400">Size: {version.fileSize ? `${Math.round(version.fileSize / 1024)} KB` : 'Unknown'}</div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>

              <TabPane tab="Comments & Activity" key="comments">
                <div className="mb-4">
                  <Card size="small" title="Add Comment">
                    <Input.TextArea
                      rows={4}
                      placeholder="Write your comment here..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={{ marginBottom: 16 }}
                    />
                    <div>
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        loading={submittingComment}
                        onClick={handleCommentSubmit}
                        disabled={!commentText.trim()}
                        size="large"
                      >
                        Post Comment
                      </Button>
                    </div>
                  </Card>
                </div>
                
                <List
                  className="comment-list"
                  header={`${document.comments?.length || 0} comments`}
                  itemLayout="horizontal"
                  dataSource={document.comments || []}
                  locale={{ emptyText: 'No comments yet. Be the first to comment!' }}
                  renderItem={comment => (
                    <li className="p-4 border-b border-gray-100">
                      <div className="flex">
                        <div className="mr-3">
                          <Avatar 
                            src={comment.author?.avatar?.s3Url || '/images/default-avatar.png'}
                            alt={`${comment.author?.firstName || ''} ${comment.author?.lastName || ''}`}
                          >
                            {!comment.author?.avatar?.s3Url && (comment.author?.firstName?.[0] || 'U')}
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{`${comment.author?.firstName || ''} ${comment.author?.lastName || ''}`}</div>
                          <div className="text-gray-400 text-sm mb-2">{dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                          <div className="text-gray-700">{comment.content}</div>
                        </div>
                      </div>
                    </li>
                  )}
                />
              </TabPane>
            </Tabs>
          </Card>
        </div>

        {/* Right Column */}
        <div className="w-1/3">
          <Card title="Document Cover" className="mb-6">
            <div className="relative w-full h-64">
              <Image 
                src={getDocumentCoverUrl(document.cover)} 
                alt={document.title}
                fill
                className="object-contain"
              />
            </div>
          </Card>

          <Card title="Access Control" className="mb-6">
            <Descriptions column={1}>
              <Descriptions.Item label="Security Level">
                <Tag color={securityColors[document.securityLevel]}>{document.securityLevel}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {document.department?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Permission Groups">
                {document.permissionGroups && document.permissionGroups.length > 0 
                  ? document.permissionGroups.map(group => (
                      <Tag key={group.id}>{group.name}</Tag>
                    ))
                  : 'No specific permission groups'
                }
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>

      {/* Edit Document Modal */}
      {document && (
        <EditDocumentModal 
          open={showEditModal}
          document={{
            id: document.id,
            title: document.title,
            description: document.description || '',
            fileType: 'pdf', // Default value
            size: 0, // Default value
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            tags: document.tags?.map(tag => tag.tag.id) || [],
            status: document.status,
            securityLevel: document.securityLevel,
            department: document.department?.id || '',
            departmentId: document.departmentId || '',
            cover: document.cover || undefined,
            owner: {
              id: document.creatorId,
              name: `${document.creator.firstName} ${document.creator.lastName}`,
            }
          }}
          onCancel={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}

      {/* PDF Viewer Modal */}
      <Modal
        title={
          selectedVersionForView ? (
            <div className="flex items-center gap-2">
              <span>{document?.title} - Version {selectedVersionForView.versionNumber}</span>
              {document?.versions && 
               document.versions[document.versions.length - 1]?.id === selectedVersionForView.id && (
                <Tag color="green">Latest</Tag>
              )}
            </div>
          ) : 'Document Viewer'
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedVersionForView(null);
        }}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedVersionForView && handleDownloadVersion(selectedVersionForView)}
          >
            Download
          </Button>,
        ]}
      >
        {selectedVersionForView?.s3Key && (
          <iframe
            src={DocumentsApi.getFileViewUrl(selectedVersionForView.s3Key)}
            style={{ width: '100%', height: '80vh', border: 'none' }}
            title="PDF Viewer"
          />
        )}
      </Modal>
    </div>
  );
}