"use client";

import React from "react";
import { Row, Col, Button, Tooltip } from "antd";
import { TableOutlined, AppstoreOutlined } from "@ant-design/icons";
import DocumentCard from "./DocumentCard";

interface DocumentVersion {
  id: string;
  versionNumber: number;
  status: string;
  isLatest: boolean;
}

interface Document {
  id: string;
  title: string;
  description?: string;
  fileType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  status?: "draft" | "pending_approval" | "approved" | "rejected" | "published";
  versions?: DocumentVersion[];
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

interface DocumentGridProps {
  documents: Document[];
  onEdit?: (document: Document) => void;
  onDelete?: (id: string) => void;
  onCoverUpdate?: (documentId: string, newCoverUrl: string) => void;
  baseUrl?: string;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  canEdit?: boolean;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  onEdit,
  onDelete,
  onCoverUpdate,
  baseUrl = "/admin/documents",
  viewMode,
  onViewModeChange,
  canEdit = true, // Default to true for admin/department users
}) => {
  return (
    <div className="document-grid">
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2">
          <Tooltip title="Table View">
            <Button
              type={viewMode === "table" ? "primary" : "default"}
              icon={<TableOutlined />}
              onClick={() => onViewModeChange("table")}
              className={viewMode === "table" ? "bg-orange-500 border-orange-500" : ""}
            />
          </Tooltip>
          <Tooltip title="Grid View">
            <Button
              type={viewMode === "grid" ? "primary" : "default"}
              icon={<AppstoreOutlined />}
              onClick={() => onViewModeChange("grid")}
              className={viewMode === "grid" ? "bg-orange-500 border-orange-500" : ""}
            />
          </Tooltip>
        </div>
      </div>

      {/* Documents Grid */}
      {viewMode === "grid" && (
        <Row gutter={[24, 24]}>
          {documents.map((document) => (
            <Col
              key={document.id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={6}
              xxl={4}
            >
              <DocumentCard
                document={document}
                onEdit={onEdit}
                onDelete={onDelete}
                onCoverUpdate={onCoverUpdate}
                baseUrl={baseUrl}
                canEdit={canEdit}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default DocumentGrid;