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
  Tooltip,
  Tabs,
} from "antd";
import {
  DownloadOutlined,
  ShareAltOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";

const { Title, Text, Paragraph } = Typography;

// Interfaces
interface Document {
  id: string;
  title: string;
  description: string;
  fileType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  department: string;
  tags: string[];
  versions: number;
  downloads: number;
  views: number;
  starred: boolean;
}

// Mock data for development
const MOCK_DOCUMENT: Document = {
  id: "1",
  title: "Company Guidelines 2025",
  description:
    "Official guidelines for company policies and procedures. This comprehensive document outlines the standard operating procedures, code of conduct, and organizational policies that govern our company operations. It serves as a reference for all employees to understand company expectations and protocols.",
  fileType: "pdf",
  size: 2540000,
  createdAt: "2025-08-15T12:00:00Z",
  updatedAt: "2025-08-18T14:30:00Z",
  createdBy: "Jane Smith",
  department: "Human Resources",
  tags: ["guidelines", "policy", "public", "official", "employees"],
  versions: 3,
  downloads: 153,
  views: 278,
  starred: false,
};

// Comments mock data
const MOCK_COMMENTS = [
  {
    id: "c1",
    user: "Mark Johnson",
    avatar: "/avatars/user1.jpg",
    content:
      "This is very helpful, especially section 3.2 about remote work policies.",
    timestamp: "2025-08-16T09:23:00Z",
  },
  {
    id: "c2",
    user: "Sarah Williams",
    avatar: "/avatars/user2.jpg",
    content:
      "Could we get some clarification on the travel expense policy? It seems to have changed from the previous version.",
    timestamp: "2025-08-17T14:10:00Z",
  },
  {
    id: "c3",
    user: "Robert Chen",
    avatar: "/avatars/user3.jpg",
    content:
      "The formatting on page 12 needs to be fixed - the tables are cut off on mobile view.",
    timestamp: "2025-08-18T11:45:00Z",
  },
];

// Version history mock data
const MOCK_VERSIONS = [
  {
    version: 3,
    updatedBy: "Jane Smith",
    timestamp: "2025-08-18T14:30:00Z",
    changes: "Updated remote work policy section and fixed formatting issues",
  },
  {
    version: 2,
    updatedBy: "Mike Richards",
    timestamp: "2025-08-16T10:15:00Z",
    changes: "Added new section on cyber security guidelines",
  },
  {
    version: 1,
    updatedBy: "Jane Smith",
    timestamp: "2025-08-15T12:00:00Z",
    changes: "Initial document creation",
  },
];

// Format file size to human-readable format
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("preview");

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        // In real app, fetch from API
        // const response = await fetch(`/api/documents/${documentId}`);
        // const data = await response.json();

        // For development, use mock data with a delay
        setTimeout(() => {
          setDocument(MOCK_DOCUMENT);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching document:", error);
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleDownload = () => {
    // In real app, initiate download
    console.log(`Downloading document ${documentId}`);
    alert("Download started");
  };

  const handleShare = () => {
    // In real app, show sharing options
    console.log(`Sharing document ${documentId}`);
    alert("Share dialog would open here");
  };

  const handleStar = () => {
    // In real app, toggle star status
    setDocument((prevDoc) =>
      prevDoc ? { ...prevDoc, starred: !prevDoc.starred } : null
    );
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
              The document you are looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
            </Paragraph>
            <Button type="primary">
              <Link href="/documents">Back to Documents</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Determine file icon based on type
  const getFileIcon = () => {
    switch (document.fileType) {
      case "pdf":
        return "/icons/pdf.svg";
      case "docx":
        return "/icons/word.svg";
      case "xlsx":
        return "/icons/excel.svg";
      case "pptx":
        return "/icons/powerpoint.svg";
      default:
        return "/icons/file.svg";
    }
  };

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
          <div className="w-full md:w-64 flex-shrink-0 flex flex-col items-center">
            <div className="w-full aspect-[3/4] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
              {/* Using standard img for now - can replace with Next.js Image in production */}
              <Image
                src={getFileIcon()}
                alt={`${document.fileType.toUpperCase()} file`}
                className="w-1/2 h-auto opacity-75"
                width={120}
                height={160}
              />
            </div>

            <Space direction="vertical" className="w-full">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                className="w-full"
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
                <Button
                  icon={
                    document.starred ? (
                      <StarFilled className="text-yellow-500" />
                    ) : (
                      <StarOutlined />
                    )
                  }
                  onClick={handleStar}
                  className="flex-1"
                >
                  {document.starred ? "Starred" : "Star"}
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
                  {document.fileType.toUpperCase()} •{" "}
                  {formatFileSize(document.size)}
                </Text>
              </Space>
              <Divider type="vertical" className="!h-4" />
              <Space>
                <Tooltip title="Downloads">
                  <Space size={4}>
                    <DownloadOutlined />
                    <span>{document.downloads}</span>
                  </Space>
                </Tooltip>
              </Space>
              <Divider type="vertical" className="!h-4" />
              <Space>
                <Tooltip title="Views">
                  <Space size={4}>
                    <EyeOutlined />
                    <span>{document.views}</span>
                  </Space>
                </Tooltip>
              </Space>
              {document.starred && (
                <>
                  <Divider type="vertical" className="!h-4" />
                  <StarFilled className="text-yellow-500" />
                </>
              )}
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
                <Text strong>{document.createdBy}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text type="secondary">Department:</Text>{" "}
                <Text strong>{document.department}</Text>
              </Col>
            </Row>

            <div className="mt-4">
              <Text type="secondary" className="mb-2 inline-block">
                Tags:
              </Text>
              <div>
                {document.tags.map((tag) => (
                  <Tag key={tag} className="mr-2 mb-2">
                    {tag}
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
                    <FileTextOutlined
                      style={{ fontSize: 48 }}
                      className="text-gray-400 mb-4"
                    />
                    <Title level={4}>Document Preview</Title>
                    <Paragraph className="text-gray-500">
                      Preview is not available in this demo.
                      <br />
                      In a real application, the document would be rendered
                      here.
                    </Paragraph>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                    >
                      Download to View
                    </Button>
                  </div>
                </div>
              ),
            },
            {
              key: "versions",
              label: (
                <span>
                  <HistoryOutlined /> Version History ({MOCK_VERSIONS.length})
                </span>
              ),
              children: (
                <div className="min-h-[400px]">
                  <div className="space-y-4">
                    {MOCK_VERSIONS.map((version) => (
                      <Card
                        key={version.version}
                        size="small"
                        className="bg-gray-50"
                      >
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <Text strong>Version {version.version}</Text>
                            <Paragraph className="!mb-1">
                              {version.changes}
                            </Paragraph>
                          </div>
                          <div className="text-right mt-2 md:mt-0">
                            <Text type="secondary">
                              {format(
                                new Date(version.timestamp),
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                            </Text>
                            <br />
                            <Text type="secondary">by {version.updatedBy}</Text>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              key: "comments",
              label: (
                <span>
                  <CommentOutlined /> Comments ({MOCK_COMMENTS.length})
                </span>
              ),
              children: (
                <div className="min-h-[400px]">
                  <div className="space-y-4">
                    {MOCK_COMMENTS.map((comment) => (
                      <Card
                        key={comment.id}
                        size="small"
                        className="bg-gray-50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                            {/* Placeholder for avatar */}
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              {comment.user.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between">
                              <Text strong>{comment.user}</Text>
                              <Text type="secondary" className="text-xs">
                                {format(
                                  new Date(comment.timestamp),
                                  "MMM d, yyyy 'at' h:mm a"
                                )}
                              </Text>
                            </div>
                            <Paragraph className="!mb-0 mt-1">
                              {comment.content}
                            </Paragraph>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
