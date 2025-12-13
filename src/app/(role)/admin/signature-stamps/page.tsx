"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  Select,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  Space,
  App,
  Row,
  Col,
  Statistic,
  Upload,
  Image as AntImage,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import {
  SignaturesApi,
  Signature,
  CreateSignatureDto,
  UpdateSignatureDto,
} from "@/lib/signatures-api";

const { Dragger } = Upload;
const { TextArea } = Input;

const SignatureStampsPage = () => {
  const { message, modal } = App.useApp();
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSignature, setEditingSignature] = useState<Signature | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(
    undefined
  );
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [uploadedS3Key, setUploadedS3Key] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Fetch signatures
  const fetchSignatures = async (
    page = 1,
    pageSize = 10,
    search = "",
    isActive?: boolean
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize,
      };

      if (search) params.search = search;
      if (isActive !== undefined) params.isActive = isActive;

      const result = await SignaturesApi.getAll(params);

      // Handle both nested and flat response structures
      const data = (result as any).data?.data || (result as any).data;
      if (data && data.signatures) {
        setSignatures(data.signatures);
        setPagination({
          current: data.page,
          pageSize: data.limit,
          total: data.total,
        });

        // Calculate stats
        const allSignatures = data.signatures;
        setStats({
          total: data.total,
          active: allSignatures.filter((s: Signature) => s.isActive).length,
          inactive: allSignatures.filter((s: Signature) => !s.isActive).length,
        });
      }
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to fetch signatures"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignatures(
      pagination.current,
      pagination.pageSize,
      searchText,
      filterStatus
    );
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchSignatures(1, pagination.pageSize, value, filterStatus);
  };

  // Handle filter change
  const handleFilterChange = (value: boolean | undefined) => {
    setFilterStatus(value);
    fetchSignatures(1, pagination.pageSize, searchText, value);
  };

  // Handle table pagination
  const handleTableChange = (newPagination: any) => {
    fetchSignatures(
      newPagination.current,
      newPagination.pageSize,
      searchText,
      filterStatus
    );
  };

  // Handle create/edit modal
  const showModal = (signature?: Signature) => {
    if (signature) {
      setEditingSignature(signature);
      setPreviewImage(signature.imageUrl);
      setUploadedImageUrl(signature.imageUrl);
      setUploadedS3Key(signature.s3Key);
      form.setFieldsValue({
        name: signature.name,
        description: signature.description,
        isActive: signature.isActive,
      });
    } else {
      setEditingSignature(null);
      setPreviewImage("");
      setUploadedImageUrl("");
      setUploadedS3Key("");
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingSignature(null);
    setPreviewImage("");
    setUploadedImageUrl("");
    setUploadedS3Key("");
    setSelectedFile(null);
    form.resetFields();
  };

  // Handle image upload - only store file locally, don't upload to S3 yet
  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: "image/*",
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Image must be smaller than 5MB!");
        return Upload.LIST_IGNORE;
      }

      // Store file and create preview
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      message.success("Image selected. Click Create to upload.");

      return false;
    },
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setUploading(true);

      if (editingSignature) {
        // Update - don't need to upload new image if not changed
        const updateData: UpdateSignatureDto = {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
        };
        const result = await SignaturesApi.update(editingSignature.id, updateData);
        const responseData = (result as any).data?.data || (result as any).data;
        if ((result as any).success !== false) {
          message.success((result as any).data?.message || "Signature updated successfully");
        }
      } else {
        // Create - upload to S3 first
        if (!selectedFile) {
          message.error("Please select a signature image");
          setUploading(false);
          return;
        }

        // Get presigned URL for signatures folder
        const presignedResponse = await SignaturesApi.getPresignedUrl(
          selectedFile.name,
          selectedFile.type
        );
        
        // Handle nested response structure
        const presignedData = (presignedResponse as any).data?.data || (presignedResponse as any).data;
        const { presignedUrl, key, publicUrl } = presignedData;

        console.log("Presigned URL data:", { presignedUrl, key, publicUrl });

        // Upload to S3
        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          body: selectedFile,
          headers: {
            "Content-Type": selectedFile.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        console.log("S3 upload successful");

        // Create record in DB
        const createData: CreateSignatureDto = {
          name: values.name,
          description: values.description,
          imageUrl: publicUrl,
          s3Key: key,
        };
        const result = await SignaturesApi.create(createData);
        if ((result as any).success !== false) {
          message.success((result as any).data?.message || "Signature created successfully");
        }
      }

      handleCancel();
      fetchSignatures(
        pagination.current,
        pagination.pageSize,
        searchText,
        filterStatus
      );
    } catch (error: any) {
      console.error("Submit error:", error);
      message.error(
        error.response?.data?.message ||
          `Failed to ${editingSignature ? "update" : "create"} signature`
      );
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = (signature: Signature) => {
    modal.confirm({
      title: "Delete Signature",
      content: `Are you sure you want to delete "${signature.name}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await SignaturesApi.delete(signature.id);
          message.success("Signature deleted successfully");
          fetchSignatures(
            pagination.current,
            pagination.pageSize,
            searchText,
            filterStatus
          );
        } catch (error: any) {
          message.error(
            error.response?.data?.message || "Failed to delete signature"
          );
        }
      },
    });
  };

  // Handle toggle status
  const handleToggleStatus = async (signature: Signature) => {
    try {
      await SignaturesApi.update(signature.id, {
        isActive: !signature.isActive,
      });
      message.success(
        `Signature ${!signature.isActive ? "activated" : "deactivated"} successfully`
      );
      fetchSignatures(
        pagination.current,
        pagination.pageSize,
        searchText,
        filterStatus
      );
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Failed to update signature status"
      );
    }
  };

  const columns = [
    {
      title: "Preview",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 100,
      render: (imageUrl: string) => (
        <AntImage
          src={imageUrl}
          alt="Signature"
          width={60}
          height={40}
          style={{ objectFit: "contain" }}
          preview={{
            mask: <EyeOutlined />,
          }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text: string) => text || "-",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={isActive ? "success" : "default"}
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (createdBy: any) =>
        createdBy
          ? `${createdBy.firstName} ${createdBy.lastName}`
          : "Unknown",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: Signature) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Deactivate" : "Activate"}>
            <Button
              type="text"
              icon={
                record.isActive ? (
                  <CloseCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Signature Stamps Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage signature stamps that can be applied to documents
        </p>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Signatures"
              value={stats.total}
              prefix={<FileImageOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Inactive"
              value={stats.inactive}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#d9d9d9" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by name or description"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: "100%" }}
              value={filterStatus}
              onChange={handleFilterChange}
              allowClear
              options={[
                { label: "All Statuses", value: undefined },
                { label: "Active", value: true },
                { label: "Inactive", value: false },
              ]}
            />
          </Col>
          <Col xs={24} sm={24} md={10} className="text-right">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Add Signature
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={signatures}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingSignature ? "Edit Signature" : "Add New Signature"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
        okText={editingSignature ? "Update" : "Create"}
        confirmLoading={uploading}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Signature Name"
            rules={[
              { required: true, message: "Please enter signature name" },
              { max: 100, message: "Name cannot exceed 100 characters" },
            ]}
          >
            <Input placeholder="e.g., CEO Signature" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: "Description cannot exceed 500 characters" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Optional description for this signature stamp"
            />
          </Form.Item>

          {editingSignature && (
            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
              initialValue={true}
            >
              <Select
                options={[
                  { label: "Active", value: true },
                  { label: "Inactive", value: false },
                ]}
              />
            </Form.Item>
          )}

          <Form.Item label="Signature Image" required>
            <Dragger {...uploadProps} disabled={uploading}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag image to upload
              </p>
              <p className="ant-upload-hint">
                Support for PNG, JPG, JPEG. Max size: 5MB
              </p>
            </Dragger>
            {previewImage && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <AntImage
                  src={previewImage}
                  alt="Preview"
                  width={200}
                  style={{ border: "1px solid #d9d9d9", padding: "8px" }}
                />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SignatureStampsPage;
