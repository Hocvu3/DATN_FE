'use client';

import { useEffect, useState, useCallback } from 'react';
import { Spin, Typography, Descriptions, Tag, Button, Card, Tabs, Divider, Space, Badge, List, Avatar, App, Modal, Upload, Input, Form, Dropdown, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, EditOutlined, LockOutlined, EyeOutlined, HistoryOutlined, DeleteOutlined, UploadOutlined, SendOutlined, SwapOutlined } from '@ant-design/icons';
import { Document as DocumentType, DocumentStatus, DocumentVersion, SecurityLevel } from '@/lib/types/document.types';
import { DocumentsApi, getDocumentCoverUrl } from '@/lib/documents-api';
import { VersionApi } from '@/lib/version-api';
import { SignaturesApi } from '@/lib/signatures-api';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import EditDocumentModal from '@/components/documents/EditDocumentModal';
import { VersionTimeline } from '@/components/documents/VersionTimeline';
import { VersionComparison } from '@/components/documents/VersionComparison';
import { SignatureSelectionModal, SignatureStamp } from '@/components/documents/SignatureSelectionModal';
import { ApprovalOptionsModal } from '@/components/documents/ApprovalOptionsModal';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
  const { message, modal } = App.useApp();
  const [document, setDocument] = useState<DocumentType | null>(null);
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
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [textContent, setTextContent] = useState<string>('');
  const [compareModalVisible, setCompareModalVisible] = useState<boolean>(false);
  const [compareVersions, setCompareVersions] = useState<[DocumentVersion | null, DocumentVersion | null]>([null, null]);
  
  // Signature approval states
  const [approvalOptionsModalVisible, setApprovalOptionsModalVisible] = useState<boolean>(false);
  const [signatureModalVisible, setSignatureModalVisible] = useState<boolean>(false);
  const [signatures, setSignatures] = useState<SignatureStamp[]>([]);
  const [loadingSignatures, setLoadingSignatures] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>();
  const [versionToApprove, setVersionToApprove] = useState<DocumentVersion | null>(null);
  const [watermarkOnlyMode, setWatermarkOnlyMode] = useState<boolean>(false);

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
  const handleViewVersion = async (version: DocumentVersion) => {
    setSelectedVersionForView(version);
    setViewModalVisible(true);
    
    // If TXT file, fetch content
    if (version.mimeType === 'text/plain' || version.s3Key?.endsWith('.txt')) {
      try {
        const response = await fetch(DocumentsApi.getFileViewUrl(version.s3Key || ''));
        const text = await response.text();
        setTextContent(text);
      } catch (error) {
        message.error('Failed to load text file');
        setTextContent('Error loading file content');
      }
    } else {
      setTextContent('');
    }
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

  // Get file type from version
  const getFileType = (version: DocumentVersion): 'pdf' | 'doc' | 'txt' | 'unknown' => {
    const mimeType = version.mimeType?.toLowerCase() || '';
    const fileName = version.s3Key?.toLowerCase() || '';
    
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return 'pdf';
    }
    if (mimeType.includes('word') || mimeType.includes('msword') || 
        fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return 'doc';
    }
    if (mimeType === 'text/plain' || fileName.endsWith('.txt')) {
      return 'txt';
    }
    return 'unknown';
  };

  // Handle delete version
  const handleDeleteVersion = async (version: DocumentVersion) => {
    modal.confirm({
      title: 'Delete Version',
      content: `Are you sure you want to delete Version ${version.versionNumber}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await DocumentsApi.deleteDocumentVersion(documentId, version.versionNumber);
          message.success('Version deleted successfully', 5);
          fetchDocument(); // Refresh document
        } catch (error) {
          message.error('Failed to delete version: ' + (error instanceof Error ? error.message : 'Unknown error'), 6);
        }
      },
    });
  };

  // Handle approve version - show approval options modal
  const handleApproveVersion = async (version: DocumentVersion) => {
    setVersionToApprove(version);
    setApprovalOptionsModalVisible(true);
  };

  // Handle Skip - approve without signature or watermark
  const handleSkipApproval = async () => {
    if (!versionToApprove) return;
    
    try {
      setApprovalOptionsModalVisible(false);
      await VersionApi.approveVersion(documentId, versionToApprove.id, {});
      message.success(`Version ${versionToApprove.versionNumber} approved successfully`);
      setVersionToApprove(null);
      fetchDocument(); // Refresh document
    } catch (error) {
      message.error('Failed to approve version: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle Watermark Only - show watermark selection
  const handleWatermarkOnly = async () => {
    setApprovalOptionsModalVisible(false);
    setWatermarkOnlyMode(true); // Set mode to watermark only (don't approve)
    setSelectedSignatureId(undefined);
    setSignatureModalVisible(true);
    
    // Load watermarks
    try {
      setLoadingSignatures(true);
      const result = await SignaturesApi.getActive();
      const responseData = result.data as any;
      const signaturesData = responseData?.data || responseData || [];
      setSignatures(Array.isArray(signaturesData) ? signaturesData : []);
    } catch (error) {
      message.error("Failed to load watermarks");
      setSignatures([]);
    } finally {
      setLoadingSignatures(false);
    }
  };

  // Handle Apply All - show watermark selection for full approval
  const handleApplyAll = async () => {
    setApprovalOptionsModalVisible(false);
    setWatermarkOnlyMode(false); // Set mode to apply all (watermark + approve)
    setSelectedSignatureId(undefined);
    setSignatureModalVisible(true);
    
    // Load watermarks
    try {
      setLoadingSignatures(true);
      const result = await SignaturesApi.getActive();
      const responseData = result.data as any;
      const signaturesData = responseData?.data || responseData || [];
      setSignatures(Array.isArray(signaturesData) ? signaturesData : []);
    } catch (error) {
      message.error("Failed to load watermarks");
      setSignatures([]);
    } finally {
      setLoadingSignatures(false);
    }
  };

  // Handle approve with watermark
  const handleApproveWithSignature = async () => {
    if (!selectedSignatureId || !versionToApprove) {
      message.error('Please select a watermark');
      return;
    }

    try {
      setApproving(true);
      
      // Apply watermark using stamps/apply API
      await SignaturesApi.applySignature({
        documentId: documentId,
        signatureStampId: selectedSignatureId,
        reason: watermarkOnlyMode ? 'Watermark applied without approval' : 'Watermark applied during approval',
        type: 2, // watermark with hash
      });

      if (watermarkOnlyMode) {
        // Watermark only - don't approve the version
        message.success(`Watermark applied to Version ${versionToApprove.versionNumber}`);
      } else {
        // Apply All - approve the version after watermark
        await VersionApi.approveVersion(
          documentId,
          versionToApprove.id,
          { signatureStampId: selectedSignatureId }
        );
        message.success(`Version ${versionToApprove.versionNumber} approved successfully with watermark`);
      }

      setSignatureModalVisible(false);
      setVersionToApprove(null);
      setSelectedSignatureId(undefined);
      setWatermarkOnlyMode(false);
      fetchDocument(); // Refresh document
    } catch (error) {
      message.error('Failed to apply watermark: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setApproving(false);
    }
  };

  // Handle reject version
  const handleRejectVersion = async (version: DocumentVersion) => {
    modal.confirm({
      title: 'Reject Version',
      content: `Are you sure you want to reject Version ${version.versionNumber}?`,
      okText: 'Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await VersionApi.rejectVersion(documentId, version.id, 'Version rejected by admin');
          message.success(`Version ${version.versionNumber} rejected`);
          fetchDocument(); // Refresh document
        } catch (error) {
          message.error('Failed to reject version: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      },
    });
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
            <Badge 
              status={statusColors[(document.versions?.find(v => v.isLatest)?.status || DocumentStatus.DRAFT)] as any} 
              text={document.versions?.find(v => v.isLatest)?.status || DocumentStatus.DRAFT} 
            />
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
                
                <VersionTimeline
                  versions={document.versions || []}
                  documentId={document.id}
                  onViewVersion={handleViewVersion}
                  onDownloadVersion={handleDownloadVersion}
                  onDeleteVersion={handleDeleteVersion}
                  onApproveVersion={handleApproveVersion}
                  onRejectVersion={handleRejectVersion}
                  onCompareVersions={(v1, v2) => {
                    setCompareVersions([v1, v2]);
                    setCompareModalVisible(true);
                  }}
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
            status: (document.versions?.find(v => v.isLatest)?.status || DocumentStatus.DRAFT),
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
        {selectedVersionForView?.s3Key && (() => {
          const fileType = getFileType(selectedVersionForView);
          const fileUrl = DocumentsApi.getFileViewUrl(selectedVersionForView.s3Key);
          
          if (fileType === 'pdf') {
            return (
              <div style={{ height: '80vh', overflow: 'auto' }}>
                <PDFDocument
                  file={fileUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div className="flex items-center justify-center h-full">
                      <Spin size="large" tip="Loading PDF..." />
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-full text-red-500">
                      <div className="text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <div>Failed to load PDF</div>
                        <div className="text-sm mt-2">Please try downloading the file</div>
                      </div>
                    </div>
                  }
                >
                  {Array.from(new Array(numPages || 0), (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      width={Math.min(window.innerWidth * 0.8, 900)}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  ))}
                </PDFDocument>
              </div>
            );
          } else if (fileType === 'txt') {
            return (
              <div style={{ height: '80vh', overflow: 'auto', padding: '20px', backgroundColor: '#fff' }}>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace' }}>
                  {textContent || <Spin tip="Loading text file..." />}
                </pre>
              </div>
            );
          } else if (fileType === 'doc') {
            return (
              <div style={{ height: '80vh', overflow: 'auto' }}>
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Document Viewer"
                />
              </div>
            );
          } else {
            return (
              <div className="flex items-center justify-center h-full text-gray-500" style={{ height: '80vh' }}>
                <div className="text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <div>Preview not available for this file type</div>
                  <div className="text-sm mt-2">Please download the file to view</div>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    className="mt-4"
                    onClick={() => handleDownloadVersion(selectedVersionForView)}
                  >
                    Download File
                  </Button>
                </div>
              </div>
            );
          }
        })()}
      </Modal>

      {/* Version Comparison Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SwapOutlined />
            <span>Compare Versions</span>
          </div>
        }
        open={compareModalVisible}
        onCancel={() => {
          setCompareModalVisible(false);
          setCompareVersions([null, null]);
        }}
        footer={null}
        width={1200}
      >
        {compareVersions[0] && compareVersions[1] && (
          <VersionComparison
            version1={compareVersions[0]}
            version2={compareVersions[1]}
          />
        )}
      </Modal>

      {/* Approval Options Modal */}
      <ApprovalOptionsModal
        visible={approvalOptionsModalVisible}
        onClose={() => {
          setApprovalOptionsModalVisible(false);
          setVersionToApprove(null);
        }}
        onSkip={handleSkipApproval}
        onWatermarkOnly={handleWatermarkOnly}
        onApplyAll={handleApplyAll}
      />

      {/* Signature Approval Modal */}
      <SignatureSelectionModal
        visible={signatureModalVisible}
        signatures={signatures}
        loading={loadingSignatures}
        approving={approving}
        selectedSignatureId={selectedSignatureId}
        onSelect={setSelectedSignatureId}
        onApprove={handleApproveWithSignature}
        onCancel={() => {
          setSignatureModalVisible(false);
          setVersionToApprove(null);
          setSelectedSignatureId(undefined);
        }}
      />
    </div>
  );
}