"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";

const { Option } = Select;
const { TextArea } = Input;

interface Department {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  members: number;
  documents: number;
  createdAt: string;
  updatedAt: string;
}

interface EditDepartmentModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  department: Department | null;
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({
  open,
  onCancel,
  onSubmit,
  department,
}) => {
  const [form] = Form.useForm();

  // Initialize form with department data when modal opens
  useEffect(() => {
    if (open && department) {
      form.setFieldsValue({
        name: department.name,
        description: department.description,
        isActive: department.isActive,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, department, form]);

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={`Edit Department: ${department?.name || ''}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {/* Department Name */}
        <Form.Item
          name="name"
          label="Department Name"
          rules={[
            { required: true, message: "Please enter department name" },
            { min: 2, message: "Department name must be at least 2 characters" },
            { max: 50, message: "Department name cannot exceed 50 characters" },
          ]}
        >
          <Input 
            placeholder="e.g., Marketing, Finance, IT" 
            size="large"
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          name="description"
          label="Description"
          rules={[
            { max: 500, message: "Description cannot exceed 500 characters" },
          ]}
        >
          <TextArea
            placeholder="Brief description of the department's role and responsibilities"
            rows={4}
            showCount
            maxLength={500}
          />
        </Form.Item>

        {/* Status */}
        <Form.Item
          name="isActive"
          label="Status"
          rules={[
            { required: true, message: "Please select status" },
          ]}
        >
          <Select size="large">
            <Option value={true}>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active
              </span>
            </Option>
            <Option value={false}>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Inactive
              </span>
            </Option>
          </Select>
        </Form.Item>

        {/* Department Statistics (Read-only) */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Department Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Members:</span>
              <span className="ml-2 font-medium">{department?.members || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Total Documents:</span>
              <span className="ml-2 font-medium">{department?.documents || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-2 font-medium">
                {department?.createdAt ? new Date(department.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <span className="ml-2 font-medium">
                {department?.updatedAt ? new Date(department.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <Form.Item className="mb-0 mt-6">
          <div className="flex justify-end space-x-3">
            <Button 
              onClick={onCancel}
              size="large"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
              className="bg-blue-600 border-blue-600 hover:bg-blue-700"
            >
              Update Department
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditDepartmentModal;