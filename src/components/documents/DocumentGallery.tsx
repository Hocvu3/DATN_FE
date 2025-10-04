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

// Document interface
interface Document {
  id: string;
  title: string;
  description: string;
  fileType: string;
  size: number;
  createdAt: string;
  tags: string[];
  downloads: number;
  coverImage?: string; // URL to cover image
}

interface DocumentGalleryProps {
  documents: Document[];
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

// Function to get a placeholder image based on document type
const getPlaceholderImage = (fileType: string, index: number) => {
  // Rotate through 4 placeholder images based on index to add variety
  const imageIndex = (index % 4) + 1;

  return `/images/document-placeholder-${imageIndex}.jpg`;
};

export default function DocumentGallery({ documents }: DocumentGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {documents.map((doc, index) => (
        <Card
          key={doc.id}
          hoverable
          className="overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200"
          cover={
            <div className="relative w-full h-[300px] bg-gray-100 overflow-hidden">
              <Image
                src={doc.coverImage || getPlaceholderImage(doc.fileType, index)}
                alt={doc.title}
                fill
                className="object-cover transition-transform duration-200 hover:scale-105"
                priority={index < 6}
                onError={(e) => {
                  // Fallback to placeholder if cover image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderImage(doc.fileType, index);
                }}
              />
              
              {/* File type icon overlay */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md">
                {getFileIcon(doc.fileType)}
              </div>
              
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
            </div>
          }
        >
          <div className="px-1 pt-2">
            <div className="mb-3">
              <Link
                href={`/documents/${doc.id}`}
                className="text-lg font-medium text-gray-900 hover:text-orange-500 line-clamp-2"
              >
                {doc.title}
              </Link>
            </div>

            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
              {doc.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-4">
              {doc.tags.map((tag) => (
                <Tag key={tag} color="orange" className="m-0">
                  {tag}
                </Tag>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <span className="font-medium">Type:</span>
                <span className="uppercase">{doc.fileType}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Size:</span>
                <span>{formatFileSize(doc.size)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Updated:</span>
                <span>{format(new Date(doc.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Downloads:</span>
                <span>{doc.downloads}</span>
              </div>
            </div>

            <div className="flex justify-between border-t pt-3">
              <Tooltip title="View Document">
                <Link href={`/documents/${doc.id}`}>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    className="bg-orange-500 border-orange-500 hover:bg-orange-600"
                  >
                    View
                  </Button>
                </Link>
              </Tooltip>
              <Tooltip title="Download Document">
                <Button icon={<DownloadOutlined />}>Download</Button>
              </Tooltip>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
