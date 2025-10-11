'use client';

import { useEffect, useState, useCallback } from 'react';
import { Spin, Typography, Descriptions, Tag, Button, Card, Tabs, Divider, Space, Badge, List, Avatar, message, Modal } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, EditOutlined, LockOutlined, EyeOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [documentAssets, setDocumentAssets] = useState<any[]>([]);

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await DocumentsApi.getById(documentId);
      if (data && data.data && data.data.document) {
        const documentData = data.data.document;
        setDocument(documentData);
        console.log('Fetched document:', documentData);
        
        // Set assets directly from document response
        if (documentData.assets && documentData.assets.length > 0) {
          console.log('Setting assets from document response:', documentData.assets);
          console.log('Number of assets found:', documentData.assets.length);
          console.log('Assets details:', documentData.assets.map(asset => ({
            id: asset.id,
            filename: asset.filename,
            isCover: asset.isCover,
            contentType: asset.contentType
          })));
          setDocumentAssets(documentData.assets);
        } else {
          console.log('No assets found in document response');
          setDocumentAssets([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch document:', error);
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
      console.error('Error updating document:', error);
      message.error('Error updating document');
    }
  };

  // Handle file download
  const handleDownload = async () => {
    try {
      console.log('Download handler called, documentAssets:', documentAssets);
      
      if (!documentAssets || documentAssets.length === 0) {
        message.warning('No document files available for download');
        return;
      }

      // Get the first document file (URL đầu tiên)
      const firstAsset = documentAssets[0];
      console.log('Using first asset for download:', firstAsset);
      
      if (!firstAsset.s3Url) {
        message.error('Asset does not have a valid S3 URL');
        return;
      }

      // Extract keyPath from S3 URL - take the path after the bucket domain
      const url = new URL(firstAsset.s3Url);
      const keyPath = url.pathname.substring(1); // Remove leading slash
      console.log('Extracted keyPath for download:', keyPath);
      
      const blob = await DocumentsApi.downloadFile(keyPath);
      console.log('Download successful, blob size:', blob.size);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = firstAsset.filename || 'download';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      message.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Failed to download file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle file view
  const handleView = () => {
    try {
      console.log('View handler called, documentAssets:', documentAssets);
      
      if (!documentAssets || documentAssets.length === 0) {
        message.warning('No document files available for viewing');
        return;
      }

      // Get the first document file (URL đầu tiên)  
      const firstAsset = documentAssets[0];
      console.log('Using first asset for view:', firstAsset);
      
      if (!firstAsset.s3Url) {
        message.error('Asset does not have a valid S3 URL');
        return;
      }

      // Extract keyPath from S3 URL
      const url = new URL(firstAsset.s3Url);
      const keyPath = url.pathname.substring(1); // Remove leading slash
      console.log('Extracted keyPath for view:', keyPath);
      
      const viewUrl = DocumentsApi.getFileViewUrl(keyPath);
      console.log('Opening view URL:', viewUrl);
      window.open(viewUrl, '_blank');
    } catch (error) {
      console.error('Error viewing file:', error);
      message.error('Failed to view file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
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
          console.log('Deleting asset:', assetId);
          const response = await DocumentsApi.deleteDocumentAsset(documentId, assetId);
          console.log('Delete response:', response);
          
          if (response.status >= 200 && response.status < 300) {
            message.success('Asset deleted successfully');
            // Refresh document data to update asset list
            fetchDocument();
          } else {
            message.error('Failed to delete asset');
          }
        } catch (error) {
          console.error('Error deleting asset:', error);
          message.error('Failed to delete asset: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      },
    });
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
          <Button 
            icon={<EyeOutlined />}
            onClick={handleView}
            disabled={!documentAssets || documentAssets.length === 0}
          >
            View
          </Button>

          <Button 
            icon={<EditOutlined />} 
            type="primary"
            onClick={() => setShowEditModal(true)}
          >
            Edit Document
          </Button>
          
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={!documentAssets || documentAssets.length === 0}
          >
            Download
          </Button>
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
                <List
                  itemLayout="horizontal"
                  dataSource={document.versions || []}
                  renderItem={(version: DocumentVersion) => (
                    <List.Item
                      actions={[
                        <Button key="view" icon={<EyeOutlined />} size="small">View</Button>,
                        <Button key="download" icon={<DownloadOutlined />} size="small">Download</Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={<>Version {version.versionNumber} {version.versionNumber === 1 && <Tag color="green">Latest</Tag>}</>}
                        description={
                          <>
                            <div>Created on {dayjs(version.createdAt).format('YYYY-MM-DD HH:mm')}</div>
                            <div>{version.comment || 'No comment'}</div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>

              <TabPane tab="Comments & Activity" key="comments">
                <List
                  className="comment-list"
                  header={`${document.comments?.length || 0} comments`}
                  itemLayout="horizontal"
                  dataSource={document.comments || []}
                  renderItem={comment => (
                    <li className="p-4 border-b border-gray-100">
                      <div className="flex">
                        <div className="mr-3">
                          <Avatar src={'/images/default-avatar.png'} />
                        </div>
                        <div>
                          <div className="font-medium">{`${comment.author?.firstName || ''} ${comment.author?.lastName || ''}`}</div>
                          <div className="text-gray-400 text-sm mb-2">{dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
                          <div>{comment.content}</div>
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

          {/* Show all assets, whether cover or documents */}
          <Card title={`Document Assets (${documentAssets?.length || 0})`} className="mb-6">
            {documentAssets && documentAssets.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={documentAssets}
                renderItem={asset => (
                  <List.Item
                    actions={[
                      <Button 
                        key="view" 
                        icon={<EyeOutlined />} 
                        size="small"
                        onClick={() => {
                          try {
                            const url = new URL(asset.s3Url);
                            const keyPath = url.pathname.substring(1);
                            const viewUrl = DocumentsApi.getFileViewUrl(keyPath);
                            window.open(viewUrl, '_blank');
                          } catch (error) {
                            console.error('Error viewing asset:', error);
                            message.error('Failed to view file');
                          }
                        }}
                      >
                        View
                      </Button>,
                      <Button 
                        key="download" 
                        icon={<DownloadOutlined />} 
                        size="small"
                        onClick={async () => {
                          try {
                            const url = new URL(asset.s3Url);
                            const keyPath = url.pathname.substring(1);
                            const blob = await DocumentsApi.downloadFile(keyPath);
                            
                            const downloadUrl = window.URL.createObjectURL(blob);
                            const link = window.document.createElement('a');
                            link.href = downloadUrl;
                            link.download = asset.filename;
                            window.document.body.appendChild(link);
                            link.click();
                            window.document.body.removeChild(link);
                            window.URL.revokeObjectURL(downloadUrl);
                            
                            message.success('File downloaded successfully');
                          } catch (error) {
                            console.error('Error downloading asset:', error);
                            message.error('Failed to download file');
                          }
                        }}
                      >
                        Download
                      </Button>,
                      <Button 
                        key="delete" 
                        icon={<DeleteOutlined />} 
                        size="small"
                        danger
                        onClick={() => handleDeleteAsset(asset.id, asset.filename)}
                      >
                        Delete
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<LockOutlined className="text-gray-500 text-xl" />}
                      title={
                        <div className="flex items-center gap-2">
                          {asset.filename}
                          {asset.isCover && <Tag color="blue">Cover</Tag>}
                        </div>
                      }
                      description={`${asset.contentType || 'Unknown type'} · ${asset.sizeBytes ? `${Math.round(parseInt(asset.sizeBytes) / 1024)} KB` : 'Unknown size'}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-4 text-gray-500">
                <LockOutlined className="text-2xl mb-2" />
                <div>No document files uploaded yet</div>
                <div className="text-xs">Upload files in Edit mode to enable view/download</div>
              </div>
            )}
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
    </div>
  );
}