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
} from "antd";
import {
  DownloadOutlined,
  ShareAltOutlined,
  FileTextOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { DocumentsApi } from "@/lib/documents-api";
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("preview");

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
        } else {
          console.error("Failed to fetch document:", response);
          message.error("Failed to load document");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        message.error("Error loading document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Handle file download
  const handleDownload = async () => {
    try {
      console.log('Download handler called, documentAssets:', documentAssets);
      
      if (!documentAssets || documentAssets.length === 0) {
        message.warning('No document files available for download');
        return;
      }

      // Get the first document file (non-cover)
      const documentFile = documentAssets.find(asset => !asset.isCover);
      if (!documentFile) {
        message.warning('No document files available for download');
        return;
      }
      
      console.log('Using document file for download:', documentFile);
      
      if (!documentFile.s3Url) {
        message.error('Asset does not have a valid S3 URL');
        return;
      }

      // Extract keyPath from S3 URL
      const url = new URL(documentFile.s3Url);
      const keyPath = url.pathname.substring(1);
      console.log('Extracted keyPath for download:', keyPath);
      
      const blob = await DocumentsApi.downloadFilePublic(keyPath);
      console.log('Download successful, blob size:', blob.size);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = documentFile.filename || 'document.pdf';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      message.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          message.error('File not found on server');
        } else if (error.message.includes('403')) {
          message.error('Access denied to file');
        } else if (error.message.includes('timeout')) {
          message.error('Download timeout - please try again');
        } else {
          message.error(`Download failed: ${error.message}`);
        }
      } else {
        message.error('Failed to download file');
      }
    }
  };

  const handleShare = () => {
    // Copy current URL to clipboard
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      message.success('Document link copied to clipboard');
    }).catch(() => {
      message.error('Failed to copy link');
    });
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

  // Get file type for icon display
  const documentFile = documentAssets.find(asset => !asset.isCover);
  const fileType = getFileType(documentFile?.filename, documentFile?.contentType);
  const fileSize = documentFile ? parseInt(documentFile.sizeBytes) : 0;

  return (
    <div className="py-6">
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <Link href="/">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href="/documents">Documents</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{document.title}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Document header section */}
      <Card className="mb-6">
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
                disabled={!documentFile}
              >
                Download
              </Button>

              <div className="flex gap-2">
                <Button
                  icon={<ShareAltOutlined />}
                  onClick={handleShare}
                  className="flex-1"
                >
                  Share
                </Button>
              </div>
            </Space>
          </div>

          {/* Document details */}
          <div className="flex-1">
            <Title level={2} className="!mt-0 !mb-2">
              {document.title}
            </Title>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Space>
                <Text type="secondary">
                  {fileType.toUpperCase()} {fileSize > 0 && `• ${formatFileSize(fileSize)}`}
                </Text>
              </Space>
              <Divider type="vertical" className="!h-4" />
              <Space>
                <Tag color="green">{document.status}</Tag>
              </Space>
              <Divider type="vertical" className="!h-4" />
              <Space>
                <Tag color="blue">{document.securityLevel}</Tag>
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
      <Card>
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
                <div className="min-h-[400px] bg-gray-50 border border-gray-200 rounded p-4 flex items-center justify-center">
                  <div className="text-center">
                    {getFileIconForPlaceholder(fileType)}
                    <Title level={4} className="mt-4">Document Preview</Title>
                    <Paragraph className="text-gray-500">
                      Preview is not available for this document type.
                      <br />
                      Download the document to view its content.
                    </Paragraph>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                      disabled={!documentFile}
                    >
                      Download to View
                    </Button>
                  </div>
                </div>
              ),
            },
            {
              key: "info",
              label: (
                <span>
                  <CommentOutlined /> Document Info
                </span>
              ),
              children: (
                <div className="min-h-[400px] p-4">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div className="mb-4">
                        <Text strong>Document Number:</Text>
                        <br />
                        <Text>{document.documentNumber}</Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="mb-4">
                        <Text strong>Security Level:</Text>
                        <br />
                        <Tag color="blue">{document.securityLevel}</Tag>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="mb-4">
                        <Text strong>Status:</Text>
                        <br />
                        <Tag color="green">{document.status}</Tag>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="mb-4">
                        <Text strong>Confidential:</Text>
                        <br />
                        <Tag color={document.isConfidential ? "red" : "gray"}>
                          {document.isConfidential ? "Yes" : "No"}
                        </Tag>
                      </div>
                    </Col>
                    {documentFile && (
                      <>
                        <Col xs={24} sm={12}>
                          <div className="mb-4">
                            <Text strong>File Type:</Text>
                            <br />
                            <Text>{documentFile.contentType}</Text>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div className="mb-4">
                            <Text strong>File Size:</Text>
                            <br />
                            <Text>{formatFileSize(parseInt(documentFile.sizeBytes))}</Text>
                          </div>
                        </Col>
                      </>
                    )}
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
