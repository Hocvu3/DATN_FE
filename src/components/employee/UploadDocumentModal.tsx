"use client";

import React, { useState } from "react";
import { 
  Modal, 
  Form,
  Input, 
  Upload,
  Select,
  Button, 
  message, 
  Progress,
  Space,
  Divider
} from "antd";
import { 
  UploadOutlined, 
  FileTextOutlined,
  InboxOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import type { UploadProps, UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

interface UploadDocumentModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  open,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    setFileList(info.fileList);
    
    // Simulate upload progress
    if (info.file.status === 'uploading') {
      setUploadProgress(Math.round((info.file.percent || 0)));
    }
    
    if (info.file.status === 'done') {
      setUploadProgress(100);
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const beforeUpload = (file: UploadFile) => {
    const isValidType = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'text/plain'
    ].includes(file.type || '');

    if (!isValidType) {
      message.error('You can only upload PDF, Word, Excel, PowerPoint, Image, or Text files!');
      return false;
    }

    const isLt10M = (file.size || 0) / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (fileList.length === 0) {
        message.warning("Please upload at least one file");
        return;
      }

      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const documentData = {
        ...values,
        files: fileList,
        uploadedAt: new Date().toISOString(),
        owner: "Current Employee", // In real app, get from auth context
      };

      onSubmit(documentData);
      message.success("Document uploaded successfully!");
      
      // Reset form
      form.resetFields();
      setFileList([]);
      setUploadProgress(0);
      
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setUploadProgress(0);
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <UploadOutlined />
          Upload Document
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="mt-4"
      >
        {/* File Upload Section */}
        <Form.Item label="Upload Files" required>
          <Dragger
            multiple
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
            customRequest={({ onSuccess }) => {
              // Simulate upload
              setTimeout(() => {
                onSuccess?.("ok");
              }, 1000);
            }}
            className="upload-area"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: 48, color: "#1890ff" }} />
            </p>
            <p className="ant-upload-text">
              Click or drag files to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for PDF, Word, Excel, PowerPoint, Images, and Text files.
              <br />
              Maximum file size: 10MB per file.
            </p>
          </Dragger>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <Progress 
              percent={uploadProgress} 
              status="active" 
              className="mt-2"
            />
          )}
        </Form.Item>

        <Divider />

        {/* Document Information */}
        <Form.Item
          name="title"
          label="Document Title"
          rules={[
            { required: true, message: "Please enter document title!" },
            { min: 3, message: "Title must be at least 3 characters!" }
          ]}
        >
          <Input
            prefix={<FileTextOutlined />}
            placeholder="Enter document title"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { max: 500, message: "Description cannot exceed 500 characters!" }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Enter document description (optional)"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[
            { required: true, message: "Please select a category!" }
          ]}
        >
          <Select
            placeholder="Select document category"
            size="large"
          >
            <Option value="report">Report</Option>
            <Option value="proposal">Proposal</Option>
            <Option value="policy">Policy</Option>
            <Option value="manual">Manual</Option>
            <Option value="contract">Contract</Option>
            <Option value="presentation">Presentation</Option>
            <Option value="template">Template</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="securityLevel"
          label="Security Level"
          rules={[
            { required: true, message: "Please select security level!" }
          ]}
          initialValue="internal"
        >
          <Select
            placeholder="Select security level"
            size="large"
          >
            <Option value="public">
              <Space>
                <SafetyCertificateOutlined style={{ color: "#52c41a" }} />
                Public - Accessible to everyone
              </Space>
            </Option>
            <Option value="internal">
              <Space>
                <SafetyCertificateOutlined style={{ color: "#1890ff" }} />
                Internal - Company employees only
              </Space>
            </Option>
            <Option value="confidential">
              <Space>
                <SafetyCertificateOutlined style={{ color: "#fa8c16" }} />
                Confidential - Restricted access
              </Space>
            </Option>
            <Option value="secret">
              <Space>
                <SafetyCertificateOutlined style={{ color: "#f5222d" }} />
                Secret - Highly restricted
              </Space>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="tags"
          label="Tags"
        >
          <Select
            mode="tags"
            placeholder="Add tags (press Enter to add)"
            size="large"
            tokenSeparators={[',']}
          >
            <Option value="important">Important</Option>
            <Option value="urgent">Urgent</Option>
            <Option value="financial">Financial</Option>
            <Option value="hr">HR</Option>
            <Option value="technical">Technical</Option>
            <Option value="marketing">Marketing</Option>
            <Option value="legal">Legal</Option>
          </Select>
        </Form.Item>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button 
            onClick={handleCancel}
            size="large"
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleSave}
            loading={loading}
            size="large"
            disabled={fileList.length === 0}
            className="bg-blue-600 border-blue-600 hover:bg-blue-700"
            icon={<UploadOutlined />}
          >
            Upload Document
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UploadDocumentModal;