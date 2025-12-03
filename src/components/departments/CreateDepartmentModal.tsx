"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";

const { Option } = Select;
const { TextArea } = Input;

interface CreateDepartmentModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

const CreateDepartmentModal: React.FC<CreateDepartmentModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = (values: any) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title="Create New Department"
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
          initialValue={true}
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
              Create Department
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDepartmentModal;