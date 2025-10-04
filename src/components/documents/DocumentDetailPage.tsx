"use client";

import React, { useState } from "react";
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
  ArrowLeftOutlined
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  coverImage?: string;
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

const getPlaceholderImage = (fileType: string, index: number = 0) => {
  const imageIndex = (index % 4) + 1;
  return `/images/document-placeholder-${imageIndex}.jpg`;
};

const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({
  document,
  loading,
  userRole,
  onEdit,
  onDelete,
  onDownload,
  onShare
}) => {
  const router = useRouter();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

  // Check permissions based on role
  const canEdit = userRole === "admin" || 
                  (userRole === "department" && ["draft", "pending_approval"].includes(document.status)) ||
                  (userRole === "employee" && document.status === "draft");
  
  const canDelete = userRole === "admin" || 
                    (userRole === "department" && document.status === "draft");

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
            <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={document.coverImage || getPlaceholderImage(document.fileType, parseInt(document.id))}
                alt={document.title}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderImage(document.fileType, parseInt(document.id));
                }}
              />
              
              {/* File Type Overlay */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                {getFileIcon(document.fileType)}
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <Badge
                  status={getStatusColor(document.status) as any}
                  text={
                    <span className="text-white font-medium text-sm bg-black/60 px-3 py-1 rounded-full">
                      {getStatusLabel(document.status)}
                    </span>
                  }
                />
              </div>
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
                <Tooltip title="Download">
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={onDownload}
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
                        console.log("Edit button clicked, document:", document);
                        console.log("onEdit function:", onEdit);
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
              status={getStatusColor(document.status) as any} 
              text={getStatusLabel(document.status)} 
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