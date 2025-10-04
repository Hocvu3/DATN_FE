"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

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

interface EditDocumentModalProps {
  open: boolean;
  document: Document | null;
  onCancel: () => void;
  onSave: (values: any) => Promise<void>;
  departments: Array<{ value: string; label: string }>;
  availableTags: string[];
}

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  open,
  document,
  onCancel,
  onSave,
  departments,
  availableTags,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  // Initialize form with document data when modal opens
  useEffect(() => {
    if (open && document) {
      console.log("Setting form values for document:", document);
      form.setFieldsValue({
        title: document.title,
        description: document.description,
        department: document.department, // Use original department value
        tags: document.tags,
        status: document.status,
        securityLevel: document.securityLevel,
      });
    } else {
      form.resetFields();
    }
  }, [open, document, form]);

  const handleSave = async (values: any) => {
    console.log("Modal handleSave called with values:", values);
    try {
      setLoading(true);
      await onSave({
        id: document?.id,
        ...values,
      });
      form.resetFields();
    } catch (error) {
      console.error("Error updating document:", error);
      message.error("Failed to update document");
    } finally {
      setLoading(false);
    }
  };

  console.log("EditDocumentModal render - open:", open, "document:", document?.title);

  return (
    <Modal
      title={`Edit Document: ${document?.title || ''}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      style={{ zIndex: 1050 }}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {/* Document Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Form.Item
              name="title"
              label="Document Title"
              rules={[{ required: true, message: "Please enter document title" }]}
            >
              <Input placeholder="Enter document title" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea
                rows={4}
                placeholder="Enter document description"
              />
            </Form.Item>

            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select placeholder="Select department">
                {departments.map((dept) => (
                  <Option key={dept.value} value={dept.value}>
                    {dept.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status">
                <Option value="draft">Draft</Option>
                <Option value="pending_approval">Pending Approval</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="published">Published</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="space-y-4">
            <Form.Item name="tags" label="Tags">
              <Select
                mode="multiple"
                placeholder="Select tags"
                allowClear
                style={{ width: "100%" }}
                maxTagCount="responsive"
              >
                {availableTags.map((tag) => (
                  <Option key={tag} value={tag}>
                    {tag}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="securityLevel"
              label="Security Level"
              rules={[{ required: true, message: "Please select security level" }]}
            >
              <Select placeholder="Select security level">
                <Option value="public">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Public
                  </span>
                </Option>
                <Option value="internal">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Internal
                  </span>
                </Option>
                <Option value="confidential">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Confidential
                  </span>
                </Option>
                <Option value="secret">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Secret
                  </span>
                </Option>
                <Option value="top_secret">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Top Secret
                  </span>
                </Option>
              </Select>
            </Form.Item>

            {/* Current cover image display */}
            {document?.coverImage && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Cover Image
                </label>
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={document.coverImage}
                    alt="Document cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/document-placeholder-1.jpg";
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Cover image editing will be available in a future update
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="bg-orange-500 border-orange-500 hover:bg-orange-600"
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditDocumentModal;