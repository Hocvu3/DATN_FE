"use client";

import React from "react";
import {
  Button,
  Card,
  Input,
  Table,
  Tag as AntTag,
  Tooltip,
  Modal,
  Form,
  Space,
  ColorPicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Image from "next/image";

// Mock data for tag management
const tags = [
  {
    id: 1,
    name: "Finance",
    color: "#f50",
    description: "Financial documents and reports",
    count: 24,
  },
  {
    id: 2,
    name: "HR",
    color: "#2db7f5",
    description: "Human resources related documents",
    count: 18,
  },
  {
    id: 3,
    name: "Marketing",
    color: "#87d068",
    description: "Marketing materials and plans",
    count: 32,
  },
  {
    id: 4,
    name: "Legal",
    color: "#9254de",
    description: "Legal contracts and agreements",
    count: 15,
  },
  {
    id: 5,
    name: "Product",
    color: "#36cfc9",
    description: "Product specifications and manuals",
    count: 28,
  },
  {
    id: 6,
    name: "Research",
    color: "#ffec3d",
    description: "Research papers and data",
    count: 10,
  },
];

const TagsPage = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [editingTag, setEditingTag] = React.useState<any>(null);
  const [form] = Form.useForm();

  const showModal = (tag: any = null) => {
    setEditingTag(tag);
    if (tag) {
      form.setFieldsValue({
        ...tag,
        tagColor: tag.color,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        tagColor: "#1677ff",
      });
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      // Here we would handle saving the tag data
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Tag",
      dataIndex: "name",
      key: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <div className="flex items-center">
          <AntTag color={record.color} className="mr-2 py-1 px-3 text-sm">
            {text}
          </AntTag>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Documents Count",
      dataIndex: "count",
      key: "count",
      render: (count: number) => (
        <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-xs">
          {count}
        </span>
      ),
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: "Are you sure you want to delete this tag?",
                  content: `This will remove the "${record.name}" tag from all associated documents.`,
                  okText: "Yes, Delete",
                  okType: "danger",
                  cancelText: "No",
                  onOk() {
                    // Here we would handle the deletion
                  },
                })
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Tag Management
          </h1>
          <p className="text-gray-600">Create and manage document tags</p>
        </div>
        <div className="flex items-center">
          <Image
            src="/tags-illustration.svg"
            alt="Tags Management"
            width={100}
            height={100}
            className="hidden md:block"
          />
        </div>
      </div>

      <Card className="shadow-md">
        <div className="flex justify-between mb-4 flex-col md:flex-row gap-4">
          <Input
            placeholder="Search tags..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="flex-1 md:max-w-md"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            className="bg-blue-600"
          >
            Add Tag
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          className="mt-4"
        />
      </Card>

      <Modal
        title={editingTag ? "Edit Tag" : "Add New Tag"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingTag ? "Update" : "Add"}
        okButtonProps={{ className: "bg-blue-600" }}
      >
        <Form form={form} layout="vertical" name="tag_form" className="mt-4">
          <Form.Item
            name="name"
            label="Tag Name"
            rules={[{ required: true, message: "Please enter tag name" }]}
          >
            <Input placeholder="Enter tag name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter tag description" },
            ]}
          >
            <Input.TextArea placeholder="Enter tag description" rows={3} />
          </Form.Item>

          <Form.Item
            name="tagColor"
            label="Tag Color"
            rules={[{ required: true, message: "Please select tag color" }]}
          >
            <ColorPicker />
          </Form.Item>

          {editingTag && (
            <Form.Item
              name="count"
              label="Used in Documents"
              className="opacity-50"
            >
              <Input disabled />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default TagsPage;
