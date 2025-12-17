"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  message,
  Input,
  Select,
  Row,
  Col,
  Drawer,
  Space,
  Spin,
  Typography,
  Divider,
  Empty,
  Tooltip,
} from "antd";
import {
  FileTextOutlined,
  RobotOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { getDocumentsForOcr, analyzeDocument, type Document, type DocumentAnalysisResult } from "@/lib/ocr-api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

export default function AiOcrPage() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  
  // Analysis drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [page, limit, statusFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await getDocumentsForOcr({
        page,
        limit,
        status: statusFilter,
        search: searchText,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (response.data?.success) {
        setDocuments(response.data.data.documents);
        setTotal(response.data.data.total);
      }
    } catch (error: any) {
      message.error(error.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchDocuments();
  };

  const handleAnalyze = async (document: Document) => {
    if (!document.latestVersion?.s3Url) {
      message.error("This document has no file to analyze");
      return;
    }

    setSelectedDocument(document);
    setAnalysisResult(null);
    setDrawerVisible(true);
    setAnalyzing(true);

    try {
      const response = await analyzeDocument(document.id);
      
      if (response.data?.success) {
        setAnalysisResult(response.data.data);
        message.success("Document analyzed successfully!");
      }
    } catch (error: any) {
      message.error(error.message || "Failed to analyze document");
      setDrawerVisible(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedDocument(null);
    setAnalysisResult(null);
  };

  const columns = [
    {
      title: "Document",
      dataIndex: "title",
      key: "title",
      width: 300,
      render: (text: string, record: Document) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            <FileTextOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            {text}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.documentNumber}
          </Text>
        </div>
      ),
    },
    {
      title: "Security Level",
      dataIndex: "securityLevel",
      key: "securityLevel",
      width: 120,
      render: (level: string) => {
        const colors: any = {
          PUBLIC: "green",
          INTERNAL: "blue",
          CONFIDENTIAL: "orange",
          SECRET: "red",
        };
        return <Tag color={colors[level] || "default"}>{level}</Tag>;
      },
    },
    {
      title: "Version",
      dataIndex: ["latestVersion", "versionNumber"],
      key: "version",
      width: 100,
      render: (version: number) => (
        <Tag color="purple">v{version || "N/A"}</Tag>
      ),
    },
    {
      title: "File Size",
      dataIndex: ["latestVersion", "fileSize"],
      key: "fileSize",
      width: 120,
      render: (size: number) => {
        if (!size) return "-";
        const mb = (size / (1024 * 1024)).toFixed(2);
        return `${mb} MB`;
      },
    },
    {
      title: "Creator",
      dataIndex: ["creator"],
      key: "creator",
      width: 180,
      render: (creator: any) => (
        <div>
          <div>{`${creator.firstName} ${creator.lastName}`}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {creator.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format("YYYY-MM-DD HH:mm:ss")}>
          <span>{dayjs(date).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 150,
      render: (tags: any[]) => (
        <>
          {tags?.slice(0, 2).map((tag) => (
            <Tag key={tag.id} color={tag.color}>
              {tag.name}
            </Tag>
          ))}
          {tags?.length > 2 && <Tag>+{tags.length - 2}</Tag>}
        </>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: Document) => (
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={() => handleAnalyze(record)}
          disabled={!record.latestVersion?.s3Url}
        >
          Analyze
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <RobotOutlined style={{ marginRight: 12, color: "#722ed1" }} />
          AI Document Analysis
        </Title>
        <Text type="secondary">
          Extract text and generate AI-powered summaries using AWS Textract and Claude 3.5 Sonnet
        </Text>
      </div>

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={24} md={12} lg={10}>
            <Search
              placeholder="Search by title or document number..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Select.Option value="DRAFT">Draft</Select.Option>
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="APPROVED">Approved</Select.Option>
              <Select.Option value="REJECTED">Rejected</Select.Option>
              <Select.Option value="ARCHIVED">Archived</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={8} style={{ textAlign: "right" }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchDocuments}>
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} documents`,
            onChange: (page, pageSize) => {
              setPage(page);
              setLimit(pageSize);
            },
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Analysis Drawer */}
      <Drawer
        title={
          <div>
            <RobotOutlined style={{ marginRight: 8, color: "#722ed1" }} />
            AI Document Analysis
          </div>
        }
        placement="right"
        width="75%"
        onClose={handleCloseDrawer}
        open={drawerVisible}
        styles={{
          body: { padding: 0 },
        }}
      >
        {selectedDocument && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Document Info Header */}
            <div style={{ padding: "20px", borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
              <Title level={4} style={{ marginBottom: 8 }}>
                {selectedDocument.title}
              </Title>
              <Space size="middle">
                <Text type="secondary">{selectedDocument.documentNumber}</Text>
                <Tag color="purple">v{selectedDocument.latestVersion?.versionNumber}</Tag>
                <Tag>{selectedDocument.securityLevel}</Tag>
              </Space>
            </div>

            {/* Split View */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              {/* Left: PDF Viewer */}
              <div
                style={{
                  flex: 1,
                  borderRight: "1px solid #f0f0f0",
                  background: "#fafafa",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    background: "#fff",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: 500,
                  }}
                >
                  <EyeOutlined style={{ marginRight: 8 }} />
                  Document Preview
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
                  {selectedDocument.latestVersion?.s3Url ? (
                    <iframe
                      src={selectedDocument.latestVersion.s3Url}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "1px solid #d9d9d9",
                        borderRadius: 4,
                        background: "#fff",
                      }}
                      title="Document Preview"
                    />
                  ) : (
                    <Empty description="No preview available" />
                  )}
                </div>
              </div>

              {/* Right: AI Summary */}
              <div
                style={{
                  width: "45%",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    background: "#fff",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: 500,
                  }}
                >
                  <ThunderboltOutlined style={{ marginRight: 8, color: "#722ed1" }} />
                  AI-Powered Summary
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
                  {analyzing ? (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                      <Spin size="large" />
                      <div style={{ marginTop: 24 }}>
                        <Text type="secondary">
                          Extracting text with AWS Textract...
                        </Text>
                        <br />
                        <Text type="secondary">
                          Generating summary with Claude 3.5 Sonnet...
                        </Text>
                      </div>
                    </div>
                  ) : analysisResult ? (
                    <div>
                      {/* Stats */}
                      <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                          <Card size="small">
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
                                {analysisResult.confidence.toFixed(1)}%
                              </div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Confidence
                              </Text>
                            </div>
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small">
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}>
                                {analysisResult.pageCount}
                              </div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Pages
                              </Text>
                            </div>
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small">
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 24, fontWeight: "bold", color: "#722ed1" }}>
                                {(analysisResult.processingTime / 1000).toFixed(1)}s
                              </div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Processing
                              </Text>
                            </div>
                          </Card>
                        </Col>
                      </Row>

                      <Divider orientation="left">
                        <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                        Summary
                      </Divider>
                      <Card style={{ marginBottom: 24, background: "#f6ffed", borderColor: "#b7eb8f" }}>
                        <Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                          {analysisResult.summary}
                        </Paragraph>
                      </Card>

                      <Divider orientation="left">
                        <FileTextOutlined style={{ marginRight: 8 }} />
                        Extracted Text
                      </Divider>
                      <Card style={{ background: "#fafafa" }}>
                        <Paragraph
                          style={{
                            whiteSpace: "pre-wrap",
                            fontSize: 12,
                            maxHeight: 400,
                            overflow: "auto",
                            margin: 0,
                          }}
                        >
                          {analysisResult.extractedText}
                        </Paragraph>
                      </Card>
                    </div>
                  ) : (
                    <Empty
                      description="Click 'Analyze' to start AI analysis"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
