"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, Upload, Avatar } from "antd";
import { InboxOutlined, UserOutlined } from "@ant-design/icons";

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
    const departmentData = {
      ...values,
      status: values.status || "active",
      icon: "/departments-illustration.svg",
    };
    onSubmit(departmentData);
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
        {/* Department Icon/Avatar */}
        <Form.Item label="Department Icon">
          <div className="flex items-center space-x-4">
            <Avatar size={64} icon={<UserOutlined />} />
            <Upload
              name="icon"
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
            >
              <Button>Upload Icon</Button>
            </Upload>
          </div>
        </Form.Item>

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

        {/* Department Code */}
        <Form.Item
          name="code"
          label="Department Code"
          rules={[
            { required: true, message: "Please enter department code" },
            { min: 2, message: "Code must be at least 2 characters" },
            { max: 10, message: "Code cannot exceed 10 characters" },
            { pattern: /^[A-Z0-9]+$/, message: "Code must contain only uppercase letters and numbers" },
          ]}
        >
          <Input 
            placeholder="e.g., MKT, FIN, IT" 
            size="large"
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              form.setFieldsValue({ code: value });
            }}
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

        {/* Manager */}
        <Form.Item
          name="managerId"
          label="Department Manager"
          rules={[
            { required: true, message: "Please select a department manager" },
          ]}
        >
          <Select
            placeholder="Select department manager"
            size="large"
            showSearch
            filterOption={(input, option) =>
              option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
            }
          >
            <Option value="1">John Smith - Senior Manager</Option>
            <Option value="2">Sarah Johnson - Team Lead</Option>
            <Option value="3">Michael Chen - Director</Option>
            <Option value="4">Emily Davis - Senior Lead</Option>
            <Option value="5">David Wilson - Manager</Option>
          </Select>
        </Form.Item>

        {/* Location */}
        <Form.Item
          name="location"
          label="Office Location"
        >
          <Select
            placeholder="Select office location"
            size="large"
          >
            <Option value="floor1">1st Floor</Option>
            <Option value="floor2">2nd Floor</Option>
            <Option value="floor3">3rd Floor</Option>
            <Option value="floor4">4th Floor</Option>
            <Option value="remote">Remote</Option>
          </Select>
        </Form.Item>



        {/* Status */}
        <Form.Item
          name="status"
          label="Status"
          initialValue="active"
          rules={[
            { required: true, message: "Please select status" },
          ]}
        >
          <Select size="large">
            <Option value="active">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active
              </span>
            </Option>
            <Option value="inactive">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                Inactive
              </span>
            </Option>
            <Option value="pending">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Pending Setup
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