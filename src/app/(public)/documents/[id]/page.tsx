"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Breadcrumb,
  Space,
  Tag,
  Button,
  Card,
  Row,
  Col,
  Divider,
  Skeleton,
  Tabs,
  message,
  Select,
  Modal,
  Alert,
} from "antd";
import {
  DownloadOutlined,
  FileTextOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { DocumentsApi } from "@/lib/documents-api";
import { VersionApi } from "@/lib/version-api";
import { Document } from "@/lib/types/document.types";

const { Title, Text, Paragraph } = Typography;

// Function to get file icon component for placeholder
const getFileIconForPlaceholder = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <FileTextOutlined style={{ color: "#F40F02", fontSize: "40px" }} />;
    case "docx":
      return <FileTextOutlined style={{ color: "#2B579A", fontSize: "40px" }} />;
    case "xlsx":
      return <FileTextOutlined style={{ color: "#217346", fontSize: "40px" }} />;
    case "pptx":
      return <FileTextOutlined style={{ color: "#D04423", fontSize: "40px" }} />;
    default:
      return <FileTextOutlined style={{ color: "#5A5A5A", fontSize: "40px" }} />;
  }
};

// Format file size to human-readable format
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Get file type from filename or contentType
function getFileType(filename?: string, contentType?: string): string {
  if (contentType) {
    if (contentType.includes('pdf')) return 'pdf';
    if (contentType.includes('word') || contentType.includes('document')) return 'docx';
    if (contentType.includes('sheet') || contentType.includes('excel')) return 'xlsx';
    if (contentType.includes('presentation') || contentType.includes('powerpoint')) return 'pptx';
  }
  
  if (filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || 'file';
  }
  
  return 'file';
}

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [documentAssets, setDocumentAssets] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [selectedVersionAssets, setSelectedVersionAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const response = await DocumentsApi.getPublicDocumentById(documentId);
        
        if (response.status === 200 && response.data?.data?.document) {
          const documentData = response.data.data.document;
          setDocument(documentData);
          
          // Fetch document assets
          if (documentData.assets) {
            setDocumentAssets(documentData.assets);
          }

          // Get versions from document data
          if (documentData.versions && documentData.versions.length > 0) {
            setVersions(documentData.versions);
            
            // Auto-select latest version
            const latestVersion = documentData.versions.find((v: any) => v.isLatest) || documentData.versions[documentData.versions.length - 1];
            if (latestVersion) {
              setSelectedVersionId(latestVersion.id);
              // Fetch assets for selected version if available
              if (latestVersion.assets) {
                setSelectedVersionAssets(latestVersion.assets);
              }
            }
          }
        } else {
          message.error("Failed to load document");
        }
      } catch (error) {
        message.error("Error loading document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Load PDF when version changes
  useEffect(() => {
    let currentUrl: string | null = null;

    const loadPdf = async () => {
      if (!selectedVersionId) return;
      
      const selectedVersion = versions.find(v => v.id === selectedVersionId);
      if (!selectedVersion?.s3Key) return;

      try {
        // Clean up previous URL
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        const blob = await DocumentsApi.downloadFilePublic(selectedVersion.s3Key);
        const url = URL.createObjectURL(blob);
        currentUrl = url;
        setPdfUrl(url);
      } catch (error) {
        console.error('Failed to load PDF:', error);
        message.error('Failed to load PDF preview');
        setPdfUrl(null);
      }
    };

    loadPdf();

    // Cleanup on unmount
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [selectedVersionId, versions]);

  // Validate version using real API
  const validateVersionPublic = async (versionId: string, onProceed?: () => void) => {
    setValidating(true);
    
    try {
      const selectedVersion = versions.find(v => v.id === versionId);
      if (!selectedVersion) {
        message.error('Version not found');
        return false;
      }

      // Call the public validation API (no auth required)
      const response = await VersionApi.validateVersionPublic(documentId, versionId);
      
      // Extract validation result from response
      const result = (response as any).data?.data || (response as any).data || response;
      
      setValidationResult(result);
      setValidationModalVisible(true);
      
      if (onProceed) {
        setPendingAction(() => onProceed);
      }

      return result.isValid;
    } catch (error) {
      // If API call fails, show error
      message.error('Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      
      // Still allow proceed if callback provided
      if (onProceed) {
        Modal.confirm({
          title: 'Validation Unavailable',
          content: 'Could not validate document. Do you want to proceed anyway?',
          okText: 'Proceed',
          cancelText: 'Cancel',
          onOk: () => {
            onProceed();
          },
        });
      }
      
      return false;
    } finally {
      setValidating(false);
    }
  };

  // Handle validation modal proceed
  const handleValidationProceed = () => {
    setValidationModalVisible(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Handle validation modal cancel
  const handleValidationCancel = () => {
    setValidationModalVisible(false);
    setPendingAction(null);
  };

  // Validate button handler - just show validation
  const handleValidateVersion = async () => {
    if (!selectedVersionId) {
      message.warning('Please select a version to validate');
      return;
    }
    await validateVersionPublic(selectedVersionId);
  };

  // Handle file download for selected version - validate first
  const handleDownload = async () => {
    if (!selectedVersionId) {
      message.warning('Please select a version to download');
      return;
    }

    const selectedVersion = versions.find(v => v.id === selectedVersionId);
    if (!selectedVersion?.s3Key) {
      message.error('Version does not have a valid S3 key');
      return;
    }

    // Define the actual download function
    const performDownload = async () => {
      try {
        setLoadingVersions(true);
        const blob = await DocumentsApi.downloadFilePublic(selectedVersion.s3Key!);
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = downloadUrl;
        link.download = `${document?.title || 'document'}-v${selectedVersion.versionNumber}.pdf`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        message.success('File downloaded successfully', 5);
      } catch (error) {
        message.error('Failed to download file: ' + (error instanceof Error ? error.message : 'Unknown error'), 6);
      } finally {
        setLoadingVersions(false);
      }
    };

    // Validate first, then download
    await validateVersionPublic(selectedVersionId, performDownload);
  };

  if (loading) {
    return (
      <div className="py-8">
        <Skeleton active paragraph={{ rows: 1 }} className="mb-4" />
        <Card>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </Card>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="py-8">
        <Card>
          <div className="text-center py-8">
            <Title level={3}>Document Not Found</Title>
            <Paragraph>
              The document you are looking for doesn&apos;t exist or is not publicly accessible.
            </Paragraph>
            <Button type="primary">
              <Link href="/documents">Back to Documents</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Get file type for icon display - use selected version assets or fallback to document assets
  const assetsToDisplay = selectedVersionAssets.length > 0 ? selectedVersionAssets : documentAssets;
  const documentFile = assetsToDisplay.find(asset => !asset.isCover);
  const fileType = getFileType(documentFile?.filename, documentFile?.contentType);
  const fileSize = documentFile ? parseInt(documentFile.sizeBytes) : 0;

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Breadcrumb navigation */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link href="/documents">Documents</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{document.title}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Version Selector Bar */}
      {versions.length > 0 && (
        <Card bordered={false} style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Text strong>Select Version:</Text>
            <Select
              value={selectedVersionId}
              onChange={(versionId) => {
                setSelectedVersionId(versionId);
              }}
              style={{ minWidth: 200 }}
              loading={loadingVersions}
              size="large"
            >
              {versions.map((version: any) => (
                <Select.Option key={version.id} value={version.id}>
                  <Space>
                    Version {version.versionNumber}
                    {version.isLatest && <Tag color="green" style={{ margin: 0 }}>Latest</Tag>}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </div>
        </Card>
      )}

      {/* Document header section */}
      <Card bordered={false} style={{ marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Document thumbnail/preview */}
          <div className="w-40 h-52 flex-shrink-0 flex flex-col items-center">
            <div className="w-40 h-52 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              {/* Cover Image or File Icon */}
              {document.cover?.s3Url ? (
                <Image
                  src={document.cover.s3Url}
                  alt="Document cover"
                  width={160}
                  height={192}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    {getFileIconForPlaceholder(fileType)}
                    <p className="text-gray-500 text-sm mt-2">No Cover Image</p>
                  </div>
                </div>
              )}
            </div>

            <Space direction="vertical" className="w-full">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                className="w-full"
                loading={loadingVersions || validating}
              >
                Download
              </Button>
              <Button
                icon={<FileTextOutlined />}
                onClick={handleValidateVersion}
                className="w-full"
                loading={validating}
              >
                Validate
              </Button>
            </Space>
          </div>

          {/* Document details */}
          <div className="flex-1">
            <Title level={3} style={{ marginTop: 0, marginBottom: 8, fontWeight: 500 }}>
              {document.title}
            </Title>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Space>
                <Text type="secondary">
                  {fileType.toUpperCase()} {fileSize > 0 && `• ${formatFileSize(fileSize)}`}
                </Text>
              </Space>
              <Divider type="vertical" className="!h-4" />
              <Space>
                <Tag color="blue">{versions.length} Version{versions.length !== 1 ? 's' : ''}</Tag>
              </Space>
              <Divider type="vertical" className="!h-4" />
              <Space>
                <Tag color="green">{document.securityLevel}</Tag>
              </Space>
            </div>

            <div className="mb-4">
              <Paragraph>{document.description}</Paragraph>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text type="secondary">Created:</Text>{" "}
                <Text strong>
                  {format(new Date(document.createdAt), "MMM d, yyyy")}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Last Updated:</Text>{" "}
                <Text strong>
                  {format(new Date(document.updatedAt), "MMM d, yyyy")}
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Created By:</Text>{" "}
                <Text strong>{document.creator.firstName} {document.creator.lastName}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Department:</Text>{" "}
                <Text strong>{document.department?.name || 'N/A'}</Text>
              </Col>
            </Row>

            <div className="mt-4">
              <Text type="secondary" className="mb-2 inline-block">
                Tags:
              </Text>
              <div>
                {document.tags.map((documentTag) => (
                  <Tag key={documentTag.id} className="mr-2 mb-2">
                    {documentTag.tag.name}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Document content tabs */}
      <Card bordered={false} style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)", borderRadius: 4 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "preview",
              label: (
                <span>
                  <FileTextOutlined /> Preview
                </span>
              ),
              children: (
                <div className="min-h-[600px] bg-gray-50 border border-gray-200 rounded">
                  {pdfUrl ? (
                    <embed
                      src={pdfUrl}
                      type="application/pdf"
                      className="w-full h-[600px] border-0"
                      title="Document Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[600px]">
                      <div className="text-center">
                        {getFileIconForPlaceholder(fileType)}
                        <Title level={4} className="mt-4">Document Preview</Title>
                        <Paragraph className="text-gray-500">
                          {selectedVersionId ? 'Loading preview...' : 'Please select a version to preview.'}
                        </Paragraph>
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "comments",
              label: (
                <span>
                  <CommentOutlined /> Comments
                </span>
              ),
              children: (
                <div className="min-h-[400px] p-4">
                  <div className="text-center py-12">
                    <CommentOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                    <Title level={4} className="mt-4 text-gray-400">No Comments Yet</Title>
                    <Paragraph className="text-gray-400">
                      Comments are not available for public documents.
                    </Paragraph>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Validation Modal */}
      {validationResult && (
        <Modal
          title={
            <Space>
              {validationResult.isValid ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
              ) : (
                <WarningOutlined style={{ color: '#faad14', fontSize: 24 }} />
              )}
              <Title level={4} style={{ margin: 0 }}>
                {validationResult.isValid ? 'Document Validation Success' : 'Document Validation Warning'}
              </Title>
            </Space>
          }
          open={validationModalVisible}
          onOk={handleValidationProceed}
          onCancel={handleValidationCancel}
          width={600}
          footer={
            validationResult.isValid ? [
              <Button key="proceed" type="primary" onClick={handleValidationProceed}>
                {pendingAction ? 'Proceed' : 'Close'}
              </Button>,
            ] : [
              <Button key="cancel" onClick={handleValidationCancel}>
                Cancel
              </Button>,
              <Button
                key="proceed"
                type="primary"
                danger={!!pendingAction}
                onClick={handleValidationProceed}
              >
                {pendingAction ? 'Proceed Anyway' : 'Close'}
              </Button>,
            ]
          }
        >
          <Alert
            message={validationResult.message || (validationResult.isValid ? "Document is Valid" : "Validation Warning")}
            description={
              <div>
                {!validationResult.isValid ? (
                  <>
                    {(validationResult.issues || []).length > 0 && (
                      <>
                        <p style={{ marginBottom: 12 }}>The following issues were detected:</p>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {(validationResult.issues || []).map((issue: string, index: number) => (
                            <li key={index} style={{ color: '#ff4d4f', marginBottom: 4 }}>{issue}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <p style={{ marginTop: 16, color: '#8c8c8c' }}>
                      <strong>Note:</strong> You can still proceed to view or download this document.
                    </p>
                  </>
                ) : (
                  <div>
                    <p style={{ color: '#52c41a', marginBottom: 0 }}>All validation checks passed successfully.</p>
                  </div>
                )}
              </div>
            }
            type={validationResult.isValid ? "success" : "warning"}
            showIcon
          />
        </Modal>
      )}
    </div>
  );
}
