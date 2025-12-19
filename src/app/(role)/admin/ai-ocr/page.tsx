"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  message,
  Input,
  Row,
  Col,
  Drawer,
  Space,
  Spin,
  Typography,
  Empty,
  Tooltip,
  Tabs,
  Modal,
  Radio,
  RadioChangeEvent,
  Select,
} from "antd";
import {
  FileTextOutlined,
  RobotOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  StopOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { analyzeDocument, approveDocumentOcr, rejectDocumentOcr, type DocumentAnalysisResult } from "@/lib/ocr-api";
import { apiGet } from "@/lib/api";
import { SignaturesApi, type Signature } from "@/lib/signatures-api";
import { VersionApi } from "@/lib/version-api";
import { DocumentStatus } from "@/lib/types/document.types";
import { SignatureSelectionModal } from "@/components/documents/SignatureSelectionModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileSize: number;
  s3Url: string;
  s3Key: string;
  createdAt: string;
  status: string;
  document: {
    id: string;
    title: string;
    documentNumber: string;
    securityLevel: string;
  };
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AiOcrPage() {
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState("pending");
  
  // Pending approval state
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingVersions, setPendingVersions] = useState<DocumentVersion[]>([]);
  const [filteredPendingVersions, setFilteredPendingVersions] = useState<DocumentVersion[]>([]);
  const [pendingSearchText, setPendingSearchText] = useState("");
  
  // All documents state
  const [allLoading, setAllLoading] = useState(false);
  const [allVersions, setAllVersions] = useState<DocumentVersion[]>([]);
  const [filteredAllVersions, setFilteredAllVersions] = useState<DocumentVersion[]>([]);
  const [allSearchText, setAllSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [analyzing, setAnalyzing] = useState(false);
  
  // Analysis drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  
  // Signature modal state
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | undefined>();
  const [loadingSignatures, setLoadingSignatures] = useState(false);
  const [approving, setApproving] = useState(false);
  const [versionToApprove, setVersionToApprove] = useState<DocumentVersion | null>(null);

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingVersions();
    } else {
      fetchAllVersions();
    }
  }, [activeTab]);

  // Filter pending versions
  useEffect(() => {
    if (pendingSearchText) {
      const searchLower = pendingSearchText.toLowerCase();
      setFilteredPendingVersions(pendingVersions.filter(v => 
        v.document.title?.toLowerCase().includes(searchLower) ||
        v.document.documentNumber?.toLowerCase().includes(searchLower) ||
        `${v.creator?.firstName || ''} ${v.creator?.lastName || ''}`.toLowerCase().includes(searchLower)
      ));
    } else {
      setFilteredPendingVersions(pendingVersions);
    }
  }, [pendingSearchText, pendingVersions]);

  // Filter all versions
  useEffect(() => {
    let filtered = allVersions;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    // Search filter
    if (allSearchText) {
      const searchLower = allSearchText.toLowerCase();
      filtered = filtered.filter(v => 
        v.document.title?.toLowerCase().includes(searchLower) ||
        v.document.documentNumber?.toLowerCase().includes(searchLower) ||
        `${v.creator?.firstName || ''} ${v.creator?.lastName || ''}`.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAllVersions(filtered);
  }, [allSearchText, statusFilter, allVersions]);

  const fetchPendingVersions = async () => {
    setPendingLoading(true);
    try {
      // Use signatures/requests API (not /pending)
      const response = await apiGet<{
        success: boolean;
        data: {
          requests: Array<{
            id: string;
            documentVersionId: string;
            requester: {
              id: string;
              email: string;
              firstName: string;
              lastName: string;
            };
            documentVersion: {
              id: string;
              versionNumber: number;
              fileSize: number;
              s3Url: string;
              s3Key: string;
              createdAt: string;
              status: string;
              document: {
                id: string;
                title: string;
                documentNumber: string;
              };
            };
          }>;
          total: number;
        };
      }>("/signatures/requests");
      
      if (response.data?.success) {
        // Extract versions from signature requests
        const versions = response.data.data.requests
          .filter(req => req.documentVersion)
          .map(req => ({
            id: req.documentVersion.id,
            versionNumber: req.documentVersion.versionNumber,
            fileSize: req.documentVersion.fileSize,
            s3Url: req.documentVersion.s3Url,
            s3Key: req.documentVersion.s3Key,
            createdAt: req.documentVersion.createdAt,
            status: req.documentVersion.status,
            document: {
              id: req.documentVersion.document.id,
              title: req.documentVersion.document.title,
              documentNumber: req.documentVersion.document.documentNumber,
              securityLevel: 'INTERNAL', // Default if not provided
            },
            creator: req.requester, // Use requester as creator
          }));
        setPendingVersions(versions);
        setFilteredPendingVersions(versions);
      }
    } catch (error: any) {
      messageApi.error(error.message || "Failed to fetch pending documents");
      setPendingVersions([]);
      setFilteredPendingVersions([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchAllVersions = async () => {
    setAllLoading(true);
    try {
      // Get all documents and flatten their versions
      const response = await apiGet<{
        success: boolean;
        data: {
          documents: Array<{
            id: string;
            title: string;
            documentNumber: string;
            securityLevel: string;
            versions: DocumentVersion[];
          }>;
          total: number;
        };
      }>("/documents");
      
      // Flatten versions from all documents
      const allVers: DocumentVersion[] = [];
      const documents = response.data?.data?.documents || [];
      documents.forEach(doc => {
        if (doc.versions && doc.versions.length > 0) {
          doc.versions.forEach(version => {
            allVers.push({
              ...version,
              document: {
                id: doc.id,
                title: doc.title,
                documentNumber: doc.documentNumber,
                securityLevel: doc.securityLevel,
              },
            });
          });
        }
      });
      
      setAllVersions(allVers);
      setFilteredAllVersions(allVers);
    } catch (error: any) {
      messageApi.error(error.message || "Failed to fetch documents");
      setAllVersions([]);
      setFilteredAllVersions([]);
    } finally {
      setAllLoading(false);
    }
  };

  const handleAnalyze = async (version: DocumentVersion) => {
    if (!version.s3Url) {
      messageApi.error("This version has no file to analyze");
      return;
    }

    // Show PDF immediately and start analysis
    setSelectedVersion(version);
    setAnalysisResult(null);
    setDrawerVisible(true);
    setAnalyzing(true);

    try {
      const response = await analyzeDocument(version.document.id);
      
      if (response.data?.success) {
        setAnalysisResult(response.data.data);
        messageApi.success("Document analyzed successfully!");
      }
    } catch (error: any) {
      messageApi.error(error.message || "Failed to analyze document");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedVersion(null);
    setAnalysisResult(null);
  };

  // Approve/Reject handlers - using new OCR API endpoints
  const handleApprove = async (version: DocumentVersion) => {
    modal.confirm({
      title: 'Apply Stamp and Digital Sign?',
      content: 'Do you want to apply stamp and digital signature now?',
      okText: 'Proceed',
      cancelText: 'Skip',
      onOk: async () => {
        // User chose to proceed with stamp
        setVersionToApprove(version);
        setSelectedSignatureId(undefined);
        setSignatureModalVisible(true);
        
        // Load signatures
        try {
          setLoadingSignatures(true);
          const result = await SignaturesApi.getActive();
          const responseData = result.data as any;
          const signaturesData = responseData?.data || responseData || [];
          setSignatures(Array.isArray(signaturesData) ? signaturesData : []);
        } catch (error) {
          messageApi.error("Failed to load signature stamps");
          setSignatures([]);
        } finally {
          setLoadingSignatures(false);
        }
      },
      onCancel: async () => {
        // User chose to skip - use OCR approve API without stamp
        try {
          await approveDocumentOcr(version.document.id, {
            reason: 'Approved after AI analysis',
          });
          messageApi.success(`Version ${version.versionNumber} approved successfully!`);
          
          // Close drawer and refresh
          setDrawerVisible(false);
          setSelectedVersion(null);
          setAnalysisResult(null);
          setVersionToApprove(null);
          
          fetchPendingVersions(); // Refresh list
        } catch (error) {
          messageApi.error('Failed to approve version: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      },
    });
  };

  const handleApproveWithSignature = async () => {
    if (!selectedSignatureId || !versionToApprove) {
      messageApi.error('Please select a signature');
      return;
    }

    try {
      setApproving(true);
      
      // Use OCR approve API with signature stamp
      await approveDocumentOcr(versionToApprove.document.id, {
        signatureStampId: selectedSignatureId,
        reason: 'Approved after AI analysis with digital signature',
        type: 2, // stamp with hash
      });

      messageApi.success(`Version ${versionToApprove.versionNumber} approved successfully with signature!`);
      
      // Close everything and refresh
      setSignatureModalVisible(false);
      setVersionToApprove(null);
      setSelectedSignatureId(undefined);
      setDrawerVisible(false);
      setSelectedVersion(null);
      setAnalysisResult(null);
      
      fetchPendingVersions(); // Refresh list
    } catch (error) {
      messageApi.error('Failed to approve version: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (version: DocumentVersion) => {
    modal.confirm({
      title: 'Reject Version',
      content: `Are you sure you want to reject Version ${version.versionNumber} of "${version.document.title}"?`,
      okText: 'Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Use OCR reject API
          await rejectDocumentOcr(version.document.id, 'Rejected after AI analysis');
          messageApi.success(`Version ${version.versionNumber} rejected successfully!`);
          
          // Close drawer and refresh
          setDrawerVisible(false);
          setSelectedVersion(null);
          setAnalysisResult(null);
          setVersionToApprove(null);
          
          fetchPendingVersions(); // Refresh list
        } catch (error) {
          messageApi.error('Failed to reject version: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    const statusColors: Record<string, string> = {
      DRAFT: "default",
      PENDING: "warning",
      APPROVED: "success",
      REJECTED: "error",
    };
    return <Tag color={statusColors[status] || "default"}>{status}</Tag>;
  };

  // Common columns for both tables
  const getColumns = (isPending: boolean) => [
    {
      title: "Document",
      dataIndex: ["document", "title"],
      key: "title",
      width: 250,
      render: (text: string, record: DocumentVersion) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            <FileTextOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            {text}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.document.documentNumber}
          </Text>
        </div>
      ),
    },
    {
      title: "Security Level",
      dataIndex: ["document", "securityLevel"],
      key: "securityLevel",
      width: 120,
      render: (level: string) => {
        const colors: Record<string, string> = {
          PUBLIC: "green",
          INTERNAL: "blue",
          CONFIDENTIAL: "orange",
          SECRET: "red",
        };
        return <Tag color={colors[level] || "default"}>{level}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Version",
      dataIndex: "versionNumber",
      key: "version",
      width: 80,
      render: (version: number) => (
        <Tag color="purple">v{version}</Tag>
      ),
    },
    {
      title: "File Size",
      dataIndex: "fileSize",
      key: "fileSize",
      width: 100,
      render: (size: number) => {
        if (!size) return "-";
        const mb = (size / (1024 * 1024)).toFixed(2);
        return `${mb} MB`;
      },
    },
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
      width: 180,
      render: (creator: any) => (
        <div>
          <div>{`${creator?.firstName || ''} ${creator?.lastName || ''}`}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {creator?.email || '-'}
          </Text>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format("YYYY-MM-DD HH:mm:ss")}>
          <span>{dayjs(date).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: DocumentVersion) => (
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={() => {
            handleAnalyze(record);
            if (isPending) {
              setVersionToApprove(record);
            }
          }}
          size="small"
        >
          AI Summary
        </Button>
      ),
    },
  ];

  const tabItems = [
    {
      key: "pending",
      label: (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          Pending Approval
          {filteredPendingVersions.length > 0 && (
            <Tag color="warning" style={{ marginLeft: 8 }}>
              {filteredPendingVersions.length}
            </Tag>
          )}
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={16} md={12}>
              <Search
                placeholder="Search pending documents..."
                allowClear
                value={pendingSearchText}
                onChange={(e) => setPendingSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchPendingVersions}
              >
                Refresh
              </Button>
            </Col>
          </Row>
          <Table
            dataSource={filteredPendingVersions}
            columns={getColumns(true)}
            rowKey="id"
            loading={pendingLoading}
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} pending versions`,
            }}
            scroll={{ x: 1400 }}
          />
        </div>
      ),
    },
    {
      key: "all",
      label: (
        <span>
          <FileTextOutlined style={{ marginRight: 8 }} />
          All Document Versions
          {filteredAllVersions.length > 0 && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {filteredAllVersions.length}
            </Tag>
          )}
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={10}>
              <Search
                placeholder="Search documents..."
                allowClear
                value={allSearchText}
                onChange={(e) => setAllSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                style={{ width: '100%' }}
                placeholder="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Select.Option value="all">All Status</Select.Option>
                <Select.Option value="DRAFT">Draft</Select.Option>
                <Select.Option value="PENDING">Pending</Select.Option>
                <Select.Option value="APPROVED">Approved</Select.Option>
                <Select.Option value="REJECTED">Rejected</Select.Option>
              </Select>
            </Col>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAllVersions}
              >
                Refresh
              </Button>
            </Col>
          </Row>
          <Table
            dataSource={filteredAllVersions}
            columns={getColumns(false)}
            rowKey="id"
            loading={allLoading}
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} versions`,
            }}
            scroll={{ x: 1200 }}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      {messageContextHolder}
      <Card
        title={
          <Space>
            <RobotOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <Title level={3} style={{ margin: 0 }}>
              AI OCR Analysis
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Tag color="orange" icon={<ThunderboltOutlined />}>
              AWS Textract
            </Tag>
            <Tag color="purple" icon={<RobotOutlined />}>
              Claude 3.5
            </Tag>
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Analysis Drawer */}
      <Drawer
        title={
          <Space>
            <RobotOutlined style={{ color: "#1890ff" }} />
            <span>AI Document Analysis</span>
          </Space>
        }
        placement="right"
        width="90%"
        onClose={handleCloseDrawer}
        open={drawerVisible}
        extra={
          <Button icon={<CloseOutlined />} onClick={handleCloseDrawer}>
            Close
          </Button>
        }
        styles={{
          body: { padding: 0, height: "calc(100vh - 55px)" }
        }}
      >
        <div style={{ display: "flex", height: "100%" }}>
          {/* LEFT: PDF Viewer with Buttons */}
          <div style={{ 
            flex: "0 0 50%", 
            display: "flex", 
            flexDirection: "column",
            borderRight: "1px solid #f0f0f0"
          }}>
            {/* PDF */}
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              {selectedVersion?.s3Url ? (
                <iframe
                  src={selectedVersion.s3Url}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                  }}
                  title="PDF Viewer"
                />
              ) : (
                <Empty description="No PDF available" />
              )}
            </div>
            
            {/* Approve/Reject Buttons - Bottom of PDF Side */}
            {activeTab === "pending" && versionToApprove && (
              <div style={{ 
                borderTop: "1px solid #f0f0f0",
                padding: 16,
                background: "#fff"
              }}>
                <Row justify="end" gutter={16}>
                  <Col>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleApprove(versionToApprove)}
                      size="large"
                      disabled={analyzing || !analysisResult}
                      style={{ background: "#52c41a", minWidth: 150 }}
                    >
                      Approve
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      danger
                      icon={<StopOutlined />}
                      onClick={() => handleReject(versionToApprove)}
                      size="large"
                      disabled={analyzing || !analysisResult}
                      style={{ minWidth: 150 }}
                    >
                      Reject
                    </Button>
                  </Col>
                </Row>
              </div>
            )}
          </div>

          {/* RIGHT: Analysis Results */}
          <div style={{ flex: "0 0 50%", overflow: "auto", padding: 16 }}>
            {analyzing ? (
              <div style={{ textAlign: "center", padding: "100px 0" }}>
                <Spin size="large" />
                <div style={{ marginTop: 20 }}>
                  <Title level={4}>Analyzing Document...</Title>
                  <Text type="secondary">
                    Processing with AWS Textract and Claude 3.5 Sonnet
                  </Text>
                  <div style={{ marginTop: 10 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      This may take up to 5 minutes for large documents
                    </Text>
                  </div>
                </div>
              </div>
            ) : analysisResult ? (
              <Space direction="vertical" style={{ width: "100%" }} size="large">
                {/* Stats Cards */}
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Card size="small">
                      <div style={{ textAlign: "center" }}>
                        <FileTextOutlined
                          style={{ fontSize: 24, color: "#1890ff" }}
                        />
                        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>
                          {analysisResult.pageCount}
                        </div>
                        <Text type="secondary">Pages</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <div style={{ textAlign: "center" }}>
                        <CheckCircleOutlined
                          style={{ fontSize: 24, color: "#52c41a" }}
                        />
                        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>
                          {analysisResult.confidence.toFixed(1)}%
                        </div>
                        <Text type="secondary">Confidence</Text>
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small">
                      <div style={{ textAlign: "center" }}>
                        <ClockCircleOutlined
                          style={{ fontSize: 24, color: "#faad14" }}
                        />
                        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>
                          {(analysisResult.processingTime / 1000).toFixed(1)}s
                        </div>
                        <Text type="secondary">Time</Text>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* AI Summary */}
                <Card
                  title={
                    <Space>
                      <RobotOutlined style={{ color: "#722ed1" }} />
                      <span>AI Summary</span>
                    </Space>
                  }
                  size="small"
                >
                  <Paragraph style={{ whiteSpace: "pre-wrap" }}>
                    {analysisResult.summary}
                  </Paragraph>
                </Card>
              </Space>
            ) : (
              <Empty description="AI analysis results will appear here" />
            )}
          </div>
        </div>
      </Drawer>

      {/* Signature Selection Modal */}
      <SignatureSelectionModal
        visible={signatureModalVisible}
        signatures={signatures}
        loading={loadingSignatures}
        approving={approving}
        selectedSignatureId={selectedSignatureId}
        onSelect={setSelectedSignatureId}
        onApprove={handleApproveWithSignature}
        onCancel={() => {
          setSignatureModalVisible(false);
          setVersionToApprove(null);
          setSelectedSignatureId(undefined);
        }}
      />
    </div>
  );
}
