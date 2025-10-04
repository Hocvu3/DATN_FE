"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, Upload, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId: string;
  location?: string;
  status: "active" | "inactive" | "pending";
  members: number;
  documents: number;
  createdAt: string;
  updatedAt: string;
  icon?: string;
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
        code: department.code,
        description: department.description,
        managerId: department.managerId,
        location: department.location,
        status: department.status,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, department, form]);

  const handleSubmit = (values: any) => {
    const departmentData = {
      ...values,
      id: department?.id,
      updatedAt: new Date().toISOString(),
      members: department?.members || 0,
      documents: department?.documents || 0,
      createdAt: department?.createdAt || new Date().toISOString(),
    };

    onSubmit(departmentData);
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
        {/* Department Icon/Avatar */}
        <Form.Item label="Department Icon">
          <div className="flex items-center space-x-4">
            <Avatar size={64} icon={<UserOutlined />} src={department?.icon} />
            <Upload
              name="icon"
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
            >
              <Button>Change Icon</Button>
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