"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Spin,
  App,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { TagsApi, Tag } from "@/lib/tags-api";
import type { Color } from "antd/es/color-picker";

const TagsPage = () => {
  const { message, modal } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form] = Form.useForm();

  // Fetch tags function
  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const result = await TagsApi.getAll();
      if (result.data.success && result.data.data) {
        setTags(result.data.data.tags || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch tags:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load tags";
      message.error(errorMessage, 6);
    } finally {
      setLoading(false);
    }
  }, [message]);

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Filter tags based on search query
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const showModal = (tag: Tag | null = null) => {
    setEditingTag(tag);
    if (tag) {
      form.setFieldsValue({
        name: tag.name,
        description: tag.description || "",
        tagColor: tag.color || "#1677ff",
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        tagColor: "#1677ff",
      });
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Extract color value
      const colorValue = typeof values.tagColor === 'string' 
        ? values.tagColor 
        : values.tagColor?.toHexString?.() || "#1677ff";

      const tagData = {
        name: values.name,
        description: values.description,
        color: colorValue,
      };

      if (editingTag) {
        // Update existing tag
        const result = await TagsApi.update(editingTag.id, tagData);
        if (result.data.success) {
          message.success("Tag updated successfully", 5);
          fetchTags();
          form.resetFields();
          setIsModalVisible(false);
          setEditingTag(null);
        } else {
          message.error(result.data.message || "Failed to update tag", 6);
        }
      } else {
        // Create new tag
        const result = await TagsApi.create(tagData);
        if (result.data.success) {
          message.success("Tag created successfully", 5);
          fetchTags();
          form.resetFields();
          setIsModalVisible(false);
        } else {
          message.error(result.data.message || "Failed to create tag", 6);
        }
      }
    } catch (error: any) {
      if (error?.errorFields) {
        // Form validation error
        return;
      }
      console.error("Failed to save tag:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save tag";
      message.error(errorMessage, 6);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setEditingTag(null);
  };

  const handleDelete = (tag: Tag) => {
    modal.confirm({
      title: "Delete Tag",
      content: `Are you sure you want to delete "${tag.name}"? This will remove the tag from all associated documents.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setLoading(true);
          const result = await TagsApi.delete(tag.id);
          if (result.data.success) {
            message.success("Tag deleted successfully", 5);
            fetchTags();
          } else {
            message.error(result.data.message || "Failed to delete tag", 6);
          }
        } catch (error: any) {
          console.error("Failed to delete tag:", error);
          const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete tag";
          message.error(errorMessage, 6);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "Tag",
      dataIndex: "name",
      key: "name",
      sorter: (a: Tag, b: Tag) => a.name.localeCompare(b.name),
      render: (text: string, record: Tag) => (
        <div className="flex items-center">
          <AntTag color={record.color || "#1677ff"} className="mr-2 py-1 px-3 text-sm">
            {text}
          </AntTag>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || <span className="text-gray-400">No description</span>,
    },
    {
      title: "Documents Count",
      dataIndex: "_count",
      key: "documentCount",
      render: (_count: any, record: Tag) => {
        const count = _count?.documents || record.documentCount || 0;
        return (
          <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-xs">
            {count}
          </span>
        );
      },
      sorter: (a: Tag, b: Tag) => {
        const countA = a._count?.documents || a.documentCount || 0;
        const countB = b._count?.documents || b.documentCount || 0;
        return countA - countB;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <AntTag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </AntTag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Tag) => (
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
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tag Management</h1>
            <p className="text-gray-600 mt-1">Create and manage document tags</p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Tag
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TagOutlined className="text-2xl text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{tags.length}</div>
              <div className="text-sm text-gray-500">Total Tags</div>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TagOutlined className="text-2xl text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {tags.filter(t => t.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Active Tags</div>
            </div>
          </div>
        </Card>
        <Card className="border-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TagOutlined className="text-2xl text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {tags.reduce((sum, tag) => sum + (tag._count?.documents || tag.documentCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">Total Tagged Documents</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="shadow-md border-0">
        <div className="flex justify-between mb-4 flex-col md:flex-row gap-4">
          <Input
            placeholder="Search tags by name or description..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="flex-1 md:max-w-md"
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredTags}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} tags`,
            }}
            className="mt-4"
          />
        </Spin>
      </Card>

      <Modal
        title={editingTag ? "Edit Tag" : "Add New Tag"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingTag ? "Update" : "Add"}
        confirmLoading={loading}
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
            <ColorPicker showText />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TagsPage;
