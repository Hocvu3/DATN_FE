"use client";

import React from "react";
import { Card, Tag, Button, Tooltip, Avatar, Badge } from "antd";
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
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

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

interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (id: string) => void;
  baseUrl?: string;
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

// Function to get a placeholder image based on document type
const getPlaceholderImage = (fileType: string, index: number = 0) => {
  const imageIndex = (index % 4) + 1;
  return `/images/document-placeholder-${imageIndex}.jpg`;
};

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  baseUrl = "/documents",
}) => {
  return (
    <Card
      hoverable
      className="document-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border-0 group"
      cover={
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <Image
            src={document.coverImage || getPlaceholderImage(document.fileType, parseInt(document.id))}
            alt={document.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getPlaceholderImage(document.fileType, parseInt(document.id));
            }}
          />
          
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
          
          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex space-x-2">
              <Tooltip title="View Document">
                <Link href={`${baseUrl}/${document.id}`}>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<EyeOutlined />}
                    size="large"
                    className="bg-orange-500 border-orange-500 hover:bg-orange-600"
                  />
                </Link>
              </Tooltip>
              
              {onEdit && (
                <Tooltip title="Edit Document">
                  <Button
                    shape="circle"
                    icon={<EditOutlined />}
                    size="large"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={() => onEdit(document)}
                  />
                </Tooltip>
              )}
              
              <Tooltip title="Download">
                <Button
                  shape="circle"
                  icon={<DownloadOutlined />}
                  size="large"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                />
              </Tooltip>
            </div>
          </div>
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