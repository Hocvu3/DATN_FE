"use client";

import React, { useState, useRef } from "react";
import { Card, Tag, Button, Tooltip, Avatar, Badge, message } from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileWordOutlined,
  CalendarOutlined,
  UserOutlined,
  CameraOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { uploadDocumentCover } from "@/lib/documents-api";

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

interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (id: string) => void;
  onCoverUpdate?: (documentId: string, newCoverUrl: string) => void;
  baseUrl?: string;
  canEdit?: boolean;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

// Function to get file icon based on type
const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <FilePdfOutlined style={{ color: "#F40F02", fontSize: "20px" }} />;
    case "docx":
      return <FileWordOutlined style={{ color: "#2B579A", fontSize: "20px" }} />;
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#217346", fontSize: "20px" }} />;
    case "pptx":
      return <FilePptOutlined style={{ color: "#D04423", fontSize: "20px" }} />;
    default:
      return <FileTextOutlined style={{ color: "#5A5A5A", fontSize: "20px" }} />;
  }
};

// Function to get status color
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

// Function to get status label
const getStatusLabel = (status: string): string => {
  switch (status) {
    case "draft": return "Draft";
    case "pending_approval": return "Pending";
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
      return <FilePdfOutlined style={{ color: "#F40F02", fontSize: "32px" }} />;
    case "docx":
      return <FileWordOutlined style={{ color: "#2B579A", fontSize: "32px" }} />;
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#217346", fontSize: "32px" }} />;
    case "pptx":
      return <FilePptOutlined style={{ color: "#D04423", fontSize: "32px" }} />;
    default:
      return <FileTextOutlined style={{ color: "#5A5A5A", fontSize: "32px" }} />;
  }
};

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  onCoverUpdate,
  baseUrl = "/documents",
  canEdit = false,
}) => {
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle cover image upload
  const handleCoverUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      onCoverUpdate?.(document.id, newCoverUrl);
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

  return (
    <Card
      hoverable
      className="document-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border-0 group"
      cover={
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {document.cover?.s3Url ? (
            <Image
              src={document.cover.s3Url}
              alt={document.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Hide the image on error and let the fallback show
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                {getFileIconForPlaceholder(document.fileType)}
                <p className="text-gray-500 text-xs mt-2">No Cover</p>
              </div>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* File type icon */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
            {getFileIcon(document.fileType)}
          </div>
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <Badge
              status={getStatusColor(document.status) as any}
              text={
                <span className="text-white font-medium text-xs bg-black/60 px-2 py-1 rounded-full">
                  {getStatusLabel(document.status)}
                </span>
              }
            />
          </div>

          {/* Upload Cover Button for authorized users - Center position */}
          {canEdit && (
            <>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <Tooltip title={uploadingCover ? 'Uploading...' : 'Upload Cover'}>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={uploadingCover ? <LoadingOutlined spin /> : <CameraOutlined />}
                    onClick={handleCoverUpload}
                    loading={uploadingCover}
                    className="bg-blue-500/90 border-blue-500 hover:bg-blue-600 shadow-xl backdrop-blur-sm transform transition-all duration-200 hover:scale-110"
                    size="large"
                    style={{
                      width: '50px',
                      height: '50px',
                      fontSize: '20px',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
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
          
          {/* Quick actions overlay - only show on hover when not uploading */}
          {!uploadingCover && (
            <div className="absolute inset-0 bg-black/60 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pb-4">
              <div className="flex space-x-2">
                <Tooltip title="View Document">
                  <Link href={`${baseUrl}/${document.id}`}>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<EyeOutlined />}
                      size="small"
                      className="bg-orange-500 border-orange-500 hover:bg-orange-600"
                    />
                  </Link>
                </Tooltip>
                
                {onEdit && (
                  <Tooltip title="Edit Document">
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      size="small"
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      onClick={() => onEdit(document)}
                    />
                  </Tooltip>
                )}
                
                <Tooltip title="Download">
                  <Button
                    shape="circle"
                    icon={<DownloadOutlined />}
                    size="small"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  />
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className="p-1">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
          <Link href={`${baseUrl}/${document.id}`}>
            {document.title}
          </Link>
        </h3>
        
        {/* Description */}
        {document.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {document.description}
          </p>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {document.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} color="orange" className="text-xs">
              {tag}
            </Tag>
          ))}
          {document.tags.length > 3 && (
            <Tag className="text-xs">+{document.tags.length - 3}</Tag>
          )}
        </div>
        
        {/* Document Info */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <UserOutlined />
              <span>{document.owner.name}</span>
            </div>
            <span className="font-medium uppercase">{document.fileType}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <CalendarOutlined />
              <span>{format(new Date(document.updatedAt), "MMM d, yyyy")}</span>
            </div>
            <span>{formatFileSize(document.size)}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Avatar src={document.owner.avatar} size="small" />
            <span className="text-xs text-gray-500">{document.department}</span>
          </div>
          
          {onDelete && (
            <Tooltip title="Delete Document">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(document.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DocumentCard;