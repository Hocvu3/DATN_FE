"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  message,
  Select,
  Typography,
  Tabs,
  Image,
  Upload,
  Row,
  Col,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { SignaturesApi } from "@/lib/signatures-api";
import type { UploadFile } from "antd/es/upload/interface";

const { Title, Text } = Typography;
const { Search } = Input;

interface Stamp {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  s3Key: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileSize: number;
  createdAt: string;
  status: string;
  document: {
    id: string;
    title: string;
    documentNumber: string;
  };
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const StampsPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState("library");
  
  // Stamp Library State
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [filteredStamps, setFilteredStamps] = useState<Stamp[]>([]);
  const [stampSearchText, setStampSearchText] = useState<string>("");
  const [stampLoading, setStampLoading] = useState(false);
  const [stampModalVisible, setStampModalVisible] = useState(false);
  const [editingStamp, setEditingStamp] = useState<Stamp | null>(null);
  const [stampForm] = Form.useForm();
  
  // Documents to Stamp State
  const [documents, setDocuments] = useState<DocumentVersion[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentVersion[]>([]);
  const [docSearchText, setDocSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [docLoading, setDocLoading] = useState(false);
  const [applyStampModalVisible, setApplyStampModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentVersion | null>(null);
  const [availableStamps, setAvailableStamps] = useState<Stamp[]>([]);
  const [applyStampForm] = Form.useForm();

  useEffect(() => {
    if (activeTab === "library") {
      fetchStamps();
    } else if (activeTab === "documents") {
      fetchDocuments();
      fetchAvailableStamps();
    }
  }, [activeTab]);

  // Filter stamps
  useEffect(() => {
    if (stampSearchText) {
      const searchLower = stampSearchText.toLowerCase();
      setFilteredStamps(stamps.filter(stamp => 
        stamp.name.toLowerCase().includes(searchLower) ||
        stamp.description?.toLowerCase().includes(searchLower)
      ));
    } else {
      setFilteredStamps(stamps);
    }
  }, [stampSearchText, stamps]);

  // Filter documents
  useEffect(() => {
    let filtered = documents;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // Search filter
    if (docSearchText) {
      const searchLower = docSearchText.toLowerCase();
      filtered = filtered.filter(doc => {
        // Safety checks to prevent errors
        if (!doc || !doc.document) return false;
        
        const title = doc.document.title?.toLowerCase() || '';
        const documentNumber = doc.document.documentNumber?.toLowerCase() || '';
        const creatorName = doc.creator 
          ? `${doc.creator.firstName || ''} ${doc.creator.lastName || ''}`.toLowerCase()
          : '';
        
        return title.includes(searchLower) ||
               documentNumber.includes(searchLower) ||
               creatorName.includes(searchLower);
      });
    }

    setFilteredDocuments(filtered);
  }, [docSearchText, statusFilter, documents]);

  const fetchStamps = async () => {
    try {
      setStampLoading(true);
      const response = await SignaturesApi.getAll();
      // Backend returns { success, message, data: { stamps, total, page, limit } }
      const stampsData = (response.data as any)?.data?.stamps || [];
      setStamps(stampsData);
      setFilteredStamps(stampsData);
    } catch (error) {
      messageApi.error("Failed to load stamps", 3);
      setStamps([]);
      setFilteredStamps([]);
    } finally {
      setStampLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setDocLoading(true);
      // Get all documents and flatten their versions
      const response = await apiGet<{
        success: boolean;
        data: {
          documents: Array<{
            id: string;
            title: string;
            documentNumber: string;
            versions: DocumentVersion[];
          }>;
          total: number;
        };
      }>("/documents");
      
      // Flatten versions from all documents
      const allVersions: DocumentVersion[] = [];
      const documents = response.data?.data?.documents || [];
      documents.forEach(doc => {
        if (doc.versions && doc.versions.length > 0) {
          doc.versions.forEach(version => {
            allVersions.push({
              ...version,
              document: {
                id: doc.id,
                title: doc.title,
                documentNumber: doc.documentNumber,
              },
            });
          });
        }
      });
      
      setDocuments(allVersions);
      setFilteredDocuments(allVersions);
    } catch (error: any) {
      console.error("Failed to load documents:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to load documents";
      messageApi.error(errorMsg, 3);
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setDocLoading(false);
    }
  };

  const fetchAvailableStamps = async () => {
    try {
      const response = await SignaturesApi.getActive();
      // Backend returns { success, message, data: [stamps array] }
      const stampsData = (response.data as any)?.data || [];
      setAvailableStamps(Array.isArray(stampsData) ? stampsData : []);
    } catch (error) {
      messageApi.error("Failed to load available stamps", 3);
    }
  };

  const handleDeleteStamp = async (id: string) => {
    try {
      await SignaturesApi.delete(id);
      messageApi.success("Stamp deleted successfully!", 3);
      fetchStamps();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || "Failed to delete stamp", 3);
    }
  };

  const handleCreateOrUpdateStamp = async (values: any) => {
    try {
      if (editingStamp) {
        // Update existing stamp
        await SignaturesApi.update(editingStamp.id, {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
        });
        messageApi.success("Stamp updated successfully!", 3);
      } else {
        // Create new stamp - need to upload image first
        if (!values.imageFile) {
          messageApi.error("Please upload a stamp image", 3);
          return;
        }
        
        // Get presigned URL
        const presignedResponse = await SignaturesApi.getPresignedUrl(
          values.imageFile.name,
          values.imageFile.type
        );
        
        const uploadData = presignedResponse.data;
        
        // Upload to S3
        await fetch(uploadData.presignedUrl, {
          method: 'PUT',
          body: values.imageFile,
          headers: {
            'Content-Type': values.imageFile.type,
          },
        });
        
        // Create stamp record
        await SignaturesApi.create({
          name: values.name,
          description: values.description || '',
          imageUrl: uploadData.publicUrl,
          s3Key: uploadData.key,
        });
        
        messageApi.success("Stamp created successfully!", 3);
      }
      
      setStampModalVisible(false);
      stampForm.resetFields();
      setEditingStamp(null);
      fetchStamps();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || "Failed to save stamp", 3);
    }
  };

  const handleApplyStamp = async (values: { signatureStampId: string; reason?: string }) => {
    if (!selectedDocument) return;

    try {
      await SignaturesApi.applySignature({
        documentId: selectedDocument.document.id,
        signatureStampId: values.signatureStampId,
        reason: values.reason,
        type: 1, // Type 1 for stamps tab (no hash)
      });
      
      messageApi.success("Stamp applied successfully!", 3);
      setApplyStampModalVisible(false);
      applyStampForm.resetFields();
      fetchDocuments();
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || "Failed to apply stamp", 3);
    }
  };

  // Stamp Library Columns
  const stampColumns = [
    {
      title: "Preview",
      dataIndex: "imageUrl",
      key: "preview",
      width: 100,
      render: (imageUrl: string) => (
        <Image
          src={imageUrl}
          alt="Stamp"
          width={60}
          height={60}
          style={{ objectFit: "contain" }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Stamp) => (
        <Space direction="vertical" size="small">
          <Text strong>{name}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (createdBy: any) => (
        <Space direction="vertical" size="small">
          <Text>{`${createdBy?.firstName} ${createdBy?.lastName}`}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {createdBy?.email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Stamp) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingStamp(record);
              stampForm.setFieldsValue(record);
              setStampModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Stamp"
            description="Are you sure you want to delete this stamp?"
            onConfirm={() => handleDeleteStamp(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Documents to Stamp Columns
  const documentColumns = [
    {
      title: "Document",
      dataIndex: ["document"],
      key: "document",
      render: (doc: any) => (
        <Space direction="vertical" size="small">
          <Text strong>{doc?.title}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {doc?.documentNumber}
          </Text>
        </Space>
      ),
    },
    {
      title: "Version",
      dataIndex: "versionNumber",
      key: "version",
      render: (version: number) => <Tag>v{version}</Tag>,
    },
    {
      title: "Size",
      dataIndex: "fileSize",
      key: "size",
      render: (size: number) => {
        const kb = size / 1024;
        const mb = kb / 1024;
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
      },
    },
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
      render: (creator: any) => (
        <Space direction="vertical" size="small">
          <Text>{`${creator?.firstName} ${creator?.lastName}`}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {creator?.email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig: any = {
          DRAFT: { color: "default", text: "Draft" },
          PENDING_APPROVAL: { color: "orange", text: "Pending" },
          APPROVED: { color: "green", text: "Approved" },
          REJECTED: { color: "red", text: "Rejected" },
          ARCHIVED: { color: "default", text: "Archived" },
        };
        const config = statusConfig[status] || statusConfig.DRAFT;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: DocumentVersion) => (
        <Button
          type="primary"
          size="small"
          icon={<SafetyCertificateOutlined />}
          onClick={() => {
            Modal.confirm({
              title: 'Sign and Stamping?',
              content: 'Do you want to sign and stamp this document?',
              okText: 'Yes',
              cancelText: 'Skip',
              onOk() {
                setSelectedDocument(record);
                setApplyStampModalVisible(true);
              },
            });
          }}
        >
          Apply Stamp
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <SafetyCertificateOutlined /> Stamps
        </Title>
        <Text type="secondary">
          Manage signature stamps and apply them to documents
        </Text>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'library',
            label: 'Stamp Library',
            children: (
              <Card title="Signature Stamps">
                <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                  <Search
                    placeholder="Search stamps by name or description..."
                    allowClear
                    style={{ width: 350 }}
                    prefix={<SearchOutlined />}
                    onChange={(e) => setStampSearchText(e.target.value)}
                    onSearch={setStampSearchText}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingStamp(null);
                      stampForm.resetFields();
                      setStampModalVisible(true);
                    }}
                  >
                    Create Stamp
                  </Button>
                </Space>

                <Table
                  columns={stampColumns}
                  dataSource={filteredStamps}
                  rowKey="id"
                  loading={stampLoading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} stamps`,
                  }}
                />
              </Card>
            ),
          },
          {
            key: 'documents',
            label: 'Documents to Stamp',
            children: (
              <Card title="Documents Available for Stamping">
                <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <Search
                      placeholder="Search by document, number, or creator..."
                      allowClear
                      style={{ width: 350 }}
                      prefix={<SearchOutlined />}
                      onChange={(e) => setDocSearchText(e.target.value)}
                      onSearch={setDocSearchText}
                    />
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: 180 }}
                      options={[
                        { label: "All Status", value: "all" },
                        { label: "Draft", value: "DRAFT" },
                        { label: "Pending Approval", value: "PENDING_APPROVAL" },
                        { label: "Approved", value: "APPROVED" },
                        { label: "Rejected", value: "REJECTED" },
                        { label: "Archived", value: "ARCHIVED" },
                      ]}
                    />
                  </Space>
                  <Button onClick={fetchDocuments}>Refresh</Button>
                </Space>

                <Table
                  columns={documentColumns}
                  dataSource={filteredDocuments}
                  rowKey="id"
                  loading={docLoading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} documents`,
                  }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Create/Edit Stamp Modal */}
      <Modal
        title={editingStamp ? "Edit Stamp" : "Create Stamp"}
        open={stampModalVisible}
        onCancel={() => {
          setStampModalVisible(false);
          stampForm.resetFields();
          setEditingStamp(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={stampForm} onFinish={handleCreateOrUpdateStamp} layout="vertical">
          <Form.Item
            label="Stamp Name"
            name="name"
            rules={[{ required: true, message: "Please enter stamp name" }]}
          >
            <Input placeholder="Enter stamp name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter stamp description (optional)"
            />
          </Form.Item>

          {!editingStamp && (
            <Form.Item
              label="Stamp Image"
              name="imageFile"
              rules={[{ required: true, message: "Please upload stamp image" }]}
              valuePropName="file"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e[0];
                }
                return e?.file;
              }}
            >
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  // Validate file type
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    messageApi.error('You can only upload image files!', 3);
                    return Upload.LIST_IGNORE;
                  }
                  // Validate file size (max 5MB)
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    messageApi.error('Image must be smaller than 5MB!', 3);
                    return Upload.LIST_IGNORE;
                  }
                  // Store file in form
                  stampForm.setFieldValue('imageFile', file);
                  return false; // Prevent auto upload
                }}
                listType="picture-card"
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          )}

          {editingStamp && (
            <Form.Item
              label="Status"
              name="isActive"
            >
              <Select>
                <Select.Option value={true}>Active</Select.Option>
                <Select.Option value={false}>Inactive</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                {editingStamp ? "Update Stamp" : "Create Stamp"}
              </Button>
              <Button
                onClick={() => {
                  setStampModalVisible(false);
                  stampForm.resetFields();
                  setEditingStamp(null);
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Apply Stamp Modal */}
      <Modal
        title="Apply Stamp to Document"
        open={applyStampModalVisible}
        onCancel={() => {
          setApplyStampModalVisible(false);
          applyStampForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedDocument && (
          <>
            <Space direction="vertical" size="large" style={{ width: "100%", marginBottom: 24 }}>
              <div>
                <Text strong>Document: </Text>
                <Text>{selectedDocument.document.title}</Text>
              </div>
              <div>
                <Text strong>Version: </Text>
                <Tag>v{selectedDocument.versionNumber}</Tag>
              </div>
              <div>
                <Text strong>Document Number: </Text>
                <Text>{selectedDocument.document.documentNumber}</Text>
              </div>
            </Space>

            <Form form={applyStampForm} onFinish={handleApplyStamp} layout="vertical">
              <Form.Item
                label="Select Stamp"
                name="signatureStampId"
                rules={[{ required: true, message: "Please select a stamp" }]}
              >
                <Select
                  placeholder="Choose a signature stamp"
                  showSearch
                  optionFilterProp="children"
                >
                  {availableStamps.map((stamp) => (
                    <Select.Option key={stamp.id} value={stamp.id}>
                      <Space>
                        <Image
                          src={stamp.imageUrl}
                          alt={stamp.name}
                          width={30}
                          height={30}
                          preview={false}
                          style={{ objectFit: "contain" }}
                        />
                        <span>{stamp.name}</span>
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Reason (optional)"
                name="reason"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Add a reason for applying this stamp..."
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SafetyCertificateOutlined />}>
                    Apply Stamp
                  </Button>
                  <Button
                    onClick={() => {
                      setApplyStampModalVisible(false);
                      applyStampForm.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default StampsPage;
