import React, { useState, useRef, useEffect } from "react";
import { 
  Typography, 
  Button, 
  Card, 
  Tag, 
  Avatar, 
  Descriptions, 
  Space,
  Modal,
  message,
  Tooltip,
  Badge
} from "antd";
import { 
  DownloadOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ShareAltOutlined,
  EyeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  ApartmentOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  ArrowLeftOutlined,
  CameraOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { uploadDocumentCover, DocumentsApi } from "@/lib/documents-api";
// import { format } from "date-fns";

const { Title, Text } = Typography;

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

interface DocumentDetailPageProps {
  document: Document | null;
  loading: boolean;
  userRole: "admin" | "employee" | "department";
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onCoverUpdate?: (newCoverUrl: string) => void;
}

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <FilePdfOutlined style={{ color: "#F40F02", fontSize: "24px" }} />;
    case "docx":
      return <FileWordOutlined style={{ color: "#2B579A", fontSize: "24px" }} />;
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#217346", fontSize: "24px" }} />;
    case "pptx":
      return <FilePptOutlined style={{ color: "#D04423", fontSize: "24px" }} />;
    default:
      return <FileTextOutlined style={{ color: "#5A5A5A", fontSize: "24px" }} />;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "draft": return "default";
    case "pending_approval": return "processing";
    case "approved": return "success";
    case "rejected": return "error";
    case "published": return "blue";
    default: return "default";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "draft": return "Draft";
    case "pending_approval": return "Pending Approval";
    case "approved": return "Approved";
    case "rejected": return "Rejected";
    case "published": return "Published";
    default: return status;
  }
};

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

const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({
  document,
  loading,
  userRole,
  onEdit,
  onDelete,
  onDownload, // eslint-disable-line @typescript-eslint/no-unused-vars
  onShare,
  onCoverUpdate
}) => {
  const router = useRouter();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [documentAssets, setDocumentAssets] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch document assets when component mounts
  useEffect(() => {
    const fetchDocumentAssets = async () => {
      if (document?.id) {
        try {
          const response = await DocumentsApi.getDocumentAssets(document.id);
          
          if (response.data && response.data.assets) {
            // Filter out cover images to show only document files
            const documentFiles = response.data.assets.filter((asset: any) => !asset.isCover);
            setDocumentAssets(documentFiles);
          } else {
            setDocumentAssets([]);
          }
        } catch (error) {
          setDocumentAssets([]);
        }
      }
    };

    fetchDocumentAssets();
  }, [document?.id]);

  if (loading) {
    return (
      <div className="p-6">
        <Card loading />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <Title level={4}>Document Not Found</Title>
            <Text type="secondary">The document you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</Text>
            <div className="mt-4">
              <Button type="primary" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const handleDelete = () => {
    setDeleteModalVisible(false);
    onDelete?.();
    message.success("Document deleted successfully");
    router.push(`/${userRole}/documents`);
  };

  // Handle cover image upload
  const handleCoverUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !document) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('File size must be less than 5MB');
      return;
    }

    setUploadingCover(true);
    try {
      const newCoverUrl = await uploadDocumentCover(document.id, file);
      message.success('Cover image updated successfully');
      onCoverUpdate?.(newCoverUrl);
    } catch (error) {
      message.error('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle file download
  const handleDownload = async () => {
    try {
      
      if (!documentAssets || documentAssets.length === 0) {
        message.warning('No document files available for download');
        return;
      }

      // Get the first document file (URL đầu tiên)
      const firstAsset = documentAssets[0];
      
      if (!firstAsset.s3Url) {
        message.error('Asset does not have a valid S3 URL');
        return;
      }

      // Extract keyPath from S3 URL - take the path after the bucket domain
      // Example: https://bucket.s3.amazonaws.com/documents/2024/file.pdf -> documents/2024/file.pdf
      const url = new URL(firstAsset.s3Url);
      const keyPath = url.pathname.substring(1); // Remove leading slash
      
      const blob = await DocumentsApi.downloadFile(keyPath);
      
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
      message.error('Failed to download file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle file view
  const handleView = () => {
    try {
      
      if (!documentAssets || documentAssets.length === 0) {
        message.warning('No document files available for viewing');
        return;
      }

      // Get the first document file (URL đầu tiên)  
      const firstAsset = documentAssets[0];
      
      if (!firstAsset.s3Url) {
        message.error('Asset does not have a valid S3 URL');
        return;
      }

      // Extract keyPath from S3 URL
      const url = new URL(firstAsset.s3Url);
      const keyPath = url.pathname.substring(1); // Remove leading slash
      
      const viewUrl = DocumentsApi.getFileViewUrl(keyPath);
      window.open(viewUrl, '_blank');
    } catch (error) {
      message.error('Failed to view file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle individual asset view
  const handleViewAsset = (asset: any) => {
    try {
      
      if (!asset.s3Url) {
        message.error('Asset does not have a valid S3 URL');
        return;
      }

      // Extract keyPath from S3 URL
      const url = new URL(asset.s3Url);
      const keyPath = url.pathname.substring(1); // Remove leading slash
      
      const viewUrl = DocumentsApi.getFileViewUrl(keyPath);
      window.open(viewUrl, '_blank');
    } catch (error) {
      message.error('Failed to view file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle individual asset download
  const handleDownloadAsset = async (asset: any) => {
    try {
      
      if (!asset.s3Url) {
        message.error('Asset does not have a valid S3 URL');
        return;
      }

      // Extract keyPath from S3 URL
      const url = new URL(asset.s3Url);
      const keyPath = url.pathname.substring(1); // Remove leading slash
      
      const blob = await DocumentsApi.downloadFile(keyPath);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = asset.filename || 'download';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      message.success('File downloaded successfully');
    } catch (error) {
      message.error('Failed to download file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle individual asset deletion
  const handleDeleteAsset = (asset: any) => {
    Modal.confirm({
      title: 'Delete File',
      content: `Are you sure you want to delete "${asset.filename}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await DocumentsApi.deleteDocumentAsset(document.id, asset.id);
          
          if (response.status >= 200 && response.status < 300) {
            message.success('File deleted successfully');
            // Refresh assets list
            const updatedResponse = await DocumentsApi.getDocumentAssets(document.id);
            if (updatedResponse.data && updatedResponse.data.assets) {
              const documentFiles = updatedResponse.data.assets.filter((a: any) => !a.isCover);
              setDocumentAssets(documentFiles);
            }
          } else {
            message.error('Failed to delete file');
          }
        } catch (error) {
          message.error('Failed to delete file: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      },
    });
  };

  // Check permissions based on role
  const documentStatus = document.versions?.find(v => v.isLatest)?.status || DocumentStatus.DRAFT;
  const canEdit = userRole === "admin" || 
                  (userRole === "department" && ["draft", "pending_approval"].includes(documentStatus)) ||
                  (userRole === "employee" && documentStatus === "draft");
  
  const canDelete = userRole === "admin" || 
                    (userRole === "department" && documentStatus === "draft");

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push(`/${userRole}/documents`)}
          className="mb-4"
        >
          Back to Documents
        </Button>
      </div>

      {/* Document Header */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cover Image */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden group border-2 border-dashed border-gray-300">
              {/* Image or Placeholder */}
              {document.cover?.s3Url ? (
                <Image
                  src={document.cover.s3Url}
                  alt={document.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    {getFileIconForPlaceholder(document.fileType)}
                    <p className="text-gray-500 text-sm mt-2">No Cover Image</p>
                  </div>
                </div>
              )}
              
              {/* File Type Overlay */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                {getFileIcon(document.fileType)}
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <Badge
                  status={getStatusColor(documentStatus) as any}
                  text={
                    <span className="text-white font-medium text-sm bg-black/60 px-3 py-1 rounded-full">
                      {getStatusLabel(documentStatus)}
                    </span>
                  }
                />
              </div>

              {/* Upload Cover Button - Always show in center with better visibility */}
              {canEdit && (
                <>
                  {/* Semi-transparent overlay for better button visibility */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <Tooltip title={uploadingCover ? 'Uploading...' : 'Click to Upload Cover Image'}>
                      <Button
                        type="primary"
                        shape="circle"
                        icon={uploadingCover ? <LoadingOutlined spin /> : <CameraOutlined />}
                        onClick={handleCoverUpload}
                        loading={uploadingCover}
                        className="bg-blue-500/90 border-blue-500 hover:bg-blue-600 shadow-xl backdrop-blur-sm transform transition-all duration-200 hover:scale-110"
                        size="large"
                        style={{
                          width: '60px',
                          height: '60px',
                          fontSize: '24px',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                        }}
                      />
                    </Tooltip>
                  </div>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </>
              )}

              {/* Show upload hint for non-edit users */}
              {!canEdit && !document.cover?.s3Url && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <CameraOutlined className="text-3xl mb-2 opacity-50" />
                    <p className="text-sm">No cover image</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Title level={2} className="!mb-2">
                  {document.title}
                </Title>
                <Text type="secondary" className="text-lg">
                  {document.description}
                </Text>
              </div>
              
              {/* Action Buttons */}
              <Space>
                <Tooltip title={(!documentAssets || documentAssets.length === 0) ? "No document files available for viewing" : "View Document"}>
                  <Button 
                    icon={<EyeOutlined />} 
                    onClick={handleView}
                    type="default"
                    disabled={!documentAssets || documentAssets.length === 0}
                  >
                    View
                  </Button>
                </Tooltip>

                <Tooltip title={(!documentAssets || documentAssets.length === 0) ? "No document files available for download" : "Download"}>
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={handleDownload}
                    disabled={!documentAssets || documentAssets.length === 0}
                  >
                    Download
                  </Button>
                </Tooltip>
                
                <Tooltip title="Share">
                  <Button 
                    icon={<ShareAltOutlined />} 
                    onClick={onShare}
                  >
                    Share
                  </Button>
                </Tooltip>

                {canEdit && (
                  <Tooltip title="Edit Document">
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />} 
                      onClick={() => {
                        onEdit?.();
                      }}
                      className="bg-orange-500 border-orange-500 hover:bg-orange-600"
                    >
                      Edit
                    </Button>
                  </Tooltip>
                )}

                {canDelete && (
                  <Tooltip title="Delete Document">
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => setDeleteModalVisible(true)}
                    >
                      Delete
                    </Button>
                  </Tooltip>
                )}
              </Space>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <Space wrap>
                {document.tags.map((tag) => (
                  <Tag key={tag} color="orange">
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <UserOutlined className="text-gray-500" />
                <Avatar src={document.owner.avatar} size="small" />
                <Text>{document.owner.name}</Text>
              </div>
              
              <div className="flex items-center space-x-2">
                <ApartmentOutlined className="text-gray-500" />
                <Text>{document.department}</Text>
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarOutlined className="text-gray-500" />
                <Text>Updated {new Date(document.updatedAt).toLocaleDateString()}</Text>
              </div>
              
              <div className="flex items-center space-x-2">
                <FileTextOutlined className="text-gray-500" />
                <Text>{document.fileType.toUpperCase()} • {formatFileSize(document.size)}</Text>
              </div>
            </div>

            {/* Assets Status Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm text-gray-600">
                📎 Document Files: {documentAssets?.length || 0} file(s) attached
                {(!documentAssets || documentAssets.length === 0) && (
                  <Text className="block text-orange-600 text-xs mt-1">
                    ⚠️ No document files uploaded yet. Upload files in Edit mode to enable view/download.
                  </Text>
                )}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Document Details */}
      <Card title="Document Details" className="mb-6">
        <Descriptions column={2} layout="vertical">
          <Descriptions.Item label="Document ID">
            <Text code>{document.id}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="File Type">
            <div className="flex items-center space-x-2">
              {getFileIcon(document.fileType)}
              <Text>{document.fileType.toUpperCase()}</Text>
            </div>
          </Descriptions.Item>
          
          <Descriptions.Item label="File Size">
            {formatFileSize(document.size)}
          </Descriptions.Item>
          
          <Descriptions.Item label="Status">
            <Badge 
              status={getStatusColor(documentStatus) as any} 
              text={getStatusLabel(documentStatus)} 
            />
          </Descriptions.Item>
          
          <Descriptions.Item label="Created">
            {new Date(document.createdAt).toLocaleDateString()}
          </Descriptions.Item>
          
          <Descriptions.Item label="Last Modified">
            {new Date(document.updatedAt).toLocaleDateString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Document Content Preview */}
      <Card title="Document Preview" className="mb-6">
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="mb-4">
            {getFileIcon(document.fileType)}
          </div>
          <Title level={4} type="secondary">Document Preview</Title>
          <Text type="secondary">
            Preview functionality would be implemented here.<br />
            Click download to view the full document.
          </Text>
          <div className="mt-4">
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              className="bg-orange-500 border-orange-500 hover:bg-orange-600"
            >
              Open in Viewer
            </Button>
          </div>
        </div>
      </Card>

      {/* Document Assets Section */}
      {documentAssets && documentAssets.length > 0 && (
        <Card title={`Document Files (${documentAssets.length})`} className="mb-6">
          <div className="space-y-3">
            {documentAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <FileTextOutlined className="text-blue-500 text-lg" />
                  <div>
                    <Text strong className="block">
                      {asset.filename}
                    </Text>
                    <Text type="secondary" className="text-sm">
                      {asset.contentType} • {asset.sizeBytes ? `${Math.round(parseInt(asset.sizeBytes) / 1024)} KB` : 'Unknown size'}
                    </Text>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Tooltip title="View File">
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewAsset(asset)}
                      className="text-blue-600 hover:text-blue-700"
                    />
                  </Tooltip>
                  <Tooltip title="Download File">
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownloadAsset(asset)}
                      className="text-green-600 hover:text-green-700"
                    />
                  </Tooltip>
                  <Tooltip title="Delete File">
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteAsset(asset)}
                      className="text-red-600 hover:text-red-700"
                      danger
                    />
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Document"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete &quot;<strong>{document.title}</strong>&quot;? 
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default DocumentDetailPage;