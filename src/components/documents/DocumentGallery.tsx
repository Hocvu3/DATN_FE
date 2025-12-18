"use client";

import React from "react";
import { Card, Tag, Button, Tooltip } from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

// Document interface - Updated to match API response
interface Document {
  id: string;
  title: string;
  description: string;
  documentNumber: string;
  status: string;
  securityLevel: string;
  isConfidential: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  department?: {
    id: string;
    name: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
  cover?: {
    id: string;
    s3Url: string;
    filename: string;
  };
  assets?: Array<{
    id: string;
    s3Url: string;
    filename: string;
    contentType: string;
    sizeBytes: string;
    isCover: boolean;
  }>;
  versions?: Array<{
    id: string;
    versionNumber: number;
    status: string;
    isLatest: boolean;
  }>;
}

interface DocumentGalleryProps {
  documents: Document[];
  onDownload?: (document: Document) => void;
  isPublicView?: boolean;
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
      return <FilePdfOutlined style={{ color: "#F40F02", fontSize: "24px" }} />;
    case "docx":
      return (
        <FileWordOutlined style={{ color: "#2B579A", fontSize: "24px" }} />
      );
    case "xlsx":
      return (
        <FileExcelOutlined style={{ color: "#217346", fontSize: "24px" }} />
      );
    case "pptx":
      return <FilePptOutlined style={{ color: "#D04423", fontSize: "24px" }} />;
    default:
      return (
        <FileTextOutlined style={{ color: "#5A5A5A", fontSize: "24px" }} />
      );
  }
};

// Function to get file icon component for placeholder
const getFileIconForPlaceholder = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <FilePdfOutlined style={{ color: "#F40F02", fontSize: "48px" }} />;
    case "docx":
      return <FileWordOutlined style={{ color: "#2B579A", fontSize: "48px" }} />;
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#217346", fontSize: "48px" }} />;
    case "pptx":
      return <FilePptOutlined style={{ color: "#D04423", fontSize: "48px" }} />;
    default:
      return <FileTextOutlined style={{ color: "#5A5A5A", fontSize: "48px" }} />;
  }
};

// Get file type from document assets
const getDocumentFileType = (document: Document): string => {
  const documentFile = document.assets?.find(asset => !asset.isCover);
  if (documentFile?.contentType) {
    if (documentFile.contentType.includes('pdf')) return 'pdf';
    if (documentFile.contentType.includes('word') || documentFile.contentType.includes('document')) return 'docx';
    if (documentFile.contentType.includes('sheet') || documentFile.contentType.includes('excel')) return 'xlsx';
    if (documentFile.contentType.includes('presentation') || documentFile.contentType.includes('powerpoint')) return 'pptx';
  }
  
  if (documentFile?.filename) {
    const ext = documentFile.filename.split('.').pop()?.toLowerCase();
    return ext || 'file';
  }
  
  return 'file';
};

// Get file size from document assets
const getDocumentFileSize = (document: Document): number => {
  const documentFile = document.assets?.find(asset => !asset.isCover);
  return documentFile ? parseInt(documentFile.sizeBytes) : 0;
};

export default function DocumentGallery({ documents, onDownload, isPublicView = false }: DocumentGalleryProps) {
  const basePath = isPublicView ? '/documents' : '/admin/documents';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {documents.map((doc, index) => {
        const fileType = getDocumentFileType(doc);
        const fileSize = getDocumentFileSize(doc);
        
        return (
          <Card
            key={doc.id}
            hoverable
            className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200"
            cover={
              <div className="relative w-full h-[300px] bg-gray-100 overflow-hidden">
                {doc.cover?.s3Url ? (
                  <Image
                    src={doc.cover.s3Url}
                    alt={doc.title}
                    fill
                    className="object-cover transition-transform duration-200 hover:scale-105"
                    priority={index < 6}
                  />
                ) : (
                  // CSS-based placeholder when no cover image
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                    {getFileIconForPlaceholder(fileType)}
                    <div className="mt-3 text-center">
                      <p className="text-gray-500 text-sm font-medium">{fileType.toUpperCase()}</p>
                      <p className="text-gray-400 text-xs">No Preview</p>
                    </div>
                  </div>
                )}
                
                {/* File type icon overlay */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
                  {getFileIcon(fileType)}
                </div>
                
                {/* Gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
              </div>
            }
          >
            <div className="px-1 pt-2">
              <div className="mb-3 flex items-center gap-2">
                <Link
                  href={`${basePath}/${doc.id}`}
                  className="text-lg font-medium text-gray-900 hover:text-orange-500 line-clamp-2 flex-1"
                >
                  {doc.title}
                </Link>
                {isPublicView && (
                  <Tag color="blue" className="m-0 shrink-0">
                    Public
                  </Tag>
                )}
              </div>

              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {doc.description}
              </p>

              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {doc.tags.map((tag) => (
                    <Tag key={tag.id} color="orange" className="m-0">
                      {tag.name}
                    </Tag>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Type:</span>
                  <span className="uppercase">{fileType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Size:</span>
                  <span>{fileSize > 0 ? formatFileSize(fileSize) : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Department:</span>
                  <span>{doc.department?.name || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{doc.versions?.length || 0} version{(doc.versions?.length || 0) !== 1 ? 's' : ''}</span>
                  {doc.versions && doc.versions.length > 0 && (() => {
                    const latestVersion = doc.versions.find(v => v.isLatest) || doc.versions[0];
                    return (
                      <span className="text-xs text-gray-400">
                        Latest: v{latestVersion.versionNumber}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="flex justify-end border-t pt-3">
                <Tooltip title="View Document">
                  <Link href={`${basePath}/${doc.id}`}>
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      className="bg-orange-500 border-orange-500 hover:bg-orange-600"
                    >
                      View
                    </Button>
                  </Link>
                </Tooltip>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
