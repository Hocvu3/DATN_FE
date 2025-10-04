"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Table,
  Tag,
  Tooltip,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Alert,
  Tabs,
  Select,
  Switch,
  Space,
  Statistic,
  Timeline,
  Avatar,
  Divider,
  Progress,
} from "antd";
import {
  DeploymentUnitOutlined,
  EditOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BranchesOutlined,
  SendOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import Image from "next/image";

// Mock data for workflows
const workflows = [
  {
    id: 1,
    name: "Document Approval Workflow",
    description: "Standard approval process for all organizational documents",
    status: "Active",
    type: "Document",
    steps: [
      { name: "Submit", type: "start", assignee: "Author" },
      { name: "Department Review", type: "approval", assignee: "Department Manager" },
      { name: "Legal Review", type: "approval", assignee: "Legal Team" },
      { name: "Final Approval", type: "approval", assignee: "Director" },
      { name: "Publish", type: "end", assignee: "System" },
    ],
    createdBy: "Admin User",
    createdAt: "2024-01-15",
    activeInstances: 12,
    completedInstances: 156,
    averageTime: "3.2 days",
    successRate: 94,
  },
  {
    id: 2,
    name: "Employee Onboarding Workflow",
    description: "Complete onboarding process for new employees",
    status: "Active",
    type: "HR",
    steps: [
      { name: "Create Account", type: "start", assignee: "HR Admin" },
      { name: "Department Assignment", type: "task", assignee: "HR Manager" },
      { name: "Equipment Setup", type: "task", assignee: "IT Department" },
      { name: "Training Schedule", type: "task", assignee: "Training Team" },
      { name: "Complete Onboarding", type: "end", assignee: "HR Admin" },
    ],
    createdBy: "HR Admin",
    createdAt: "2024-02-01",
    activeInstances: 5,
    completedInstances: 23,
    averageTime: "5.1 days",
    successRate: 100,
  },
  {
    id: 3,
    name: "Budget Request Workflow",
    description: "Approval workflow for department budget requests",
    status: "Draft",
    type: "Finance",
    steps: [
      { name: "Submit Request", type: "start", assignee: "Requestor" },
      { name: "Department Head Review", type: "approval", assignee: "Department Head" },
      { name: "Finance Review", type: "approval", assignee: "Finance Team" },
      { name: "Executive Approval", type: "approval", assignee: "Executive Team" },
      { name: "Budget Allocation", type: "end", assignee: "Finance Admin" },
    ],
    createdBy: "Finance Admin",
    createdAt: "2024-02-10",
    activeInstances: 0,
    completedInstances: 0,
    averageTime: "N/A",
    successRate: 0,
  },
  {
    id: 4,
    name: "IT Change Request Workflow",
    description: "Process for requesting and approving IT infrastructure changes",
    status: "Paused",
    type: "IT",
    steps: [
      { name: "Submit Change Request", type: "start", assignee: "Requestor" },
      { name: "Technical Review", type: "approval", assignee: "Technical Lead" },
      { name: "Risk Assessment", type: "task", assignee: "Risk Team" },
      { name: "Implementation Planning", type: "task", assignee: "IT Team" },
      { name: "Execute Change", type: "end", assignee: "IT Admin" },
    ],
    createdBy: "IT Admin",
    createdAt: "2024-01-20",
    activeInstances: 3,
    completedInstances: 45,
    averageTime: "7.5 days",
    successRate: 89,
  },
];

const workflowTypes = ["Document", "HR", "Finance", "IT", "General"];
const workflowStatuses = ["Active", "Draft", "Paused", "Archived"];

// Mock workflow instances data
const workflowInstances = [
  {
    id: 1,
    workflowName: "Document Approval Workflow",
    instanceId: "WF-2024-001",
    initiator: "John Doe",
    currentStep: "Legal Review",
    status: "In Progress",
    startedAt: "2024-01-20T10:00:00Z",
    dueDate: "2024-01-25T17:00:00Z",
    progress: 60,
  },
  {
    id: 2,
    workflowName: "Employee Onboarding Workflow",
    instanceId: "WF-2024-002",
    initiator: "HR Admin",
    currentStep: "Equipment Setup",
    status: "In Progress",
    startedAt: "2024-01-18T09:00:00Z",
    dueDate: "2024-01-24T17:00:00Z",
    progress: 40,
  },
  {
    id: 3,
    workflowName: "Document Approval Workflow",
    instanceId: "WF-2024-003",
    initiator: "Jane Smith",
    currentStep: "Completed",
    status: "Completed",
    startedAt: "2024-01-15T14:00:00Z",
    dueDate: "2024-01-22T17:00:00Z",
    progress: 100,
  },
];

const AdminWorkflowsPage = () => {
  const [isWorkflowModalVisible, setIsWorkflowModalVisible] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("workflows");

  const showWorkflowModal = (workflow: any = null) => {
    setEditingWorkflow(workflow);
    if (workflow) {
      form.setFieldsValue({
        name: workflow.name,
        description: workflow.description,
        type: workflow.type,
        status: workflow.status,
      });
    } else {
      form.resetFields();
    }
    setIsWorkflowModalVisible(true);
  };

  const handleWorkflowOk = () => {
    form.validateFields().then((values) => {
      console.log("Workflow form values:", values);
      form.resetFields();
      setIsWorkflowModalVisible(false);
    });
  };

  const handleWorkflowCancel = () => {
    form.resetFields();
    setIsWorkflowModalVisible(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "green";
      case "Draft": return "orange";
      case "Paused": return "red";
      case "Archived": return "gray";
      default: return "blue";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <PlayCircleOutlined />;
      case "Draft": return <EditOutlined />;
      case "Paused": return <PauseCircleOutlined />;
      case "Archived": return <StopOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const workflowColumns = [
    {
      title: "Workflow Information",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
            <DeploymentUnitOutlined className="text-blue-600 text-lg" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500 max-w-xs truncate">
              {record.description}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Tag color="blue">{record.type}</Tag>
              <span className="text-xs text-gray-400">
                {record.steps.length} steps
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Performance Metrics",
      key: "metrics",
      render: (_: any, record: any) => (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Active:</span>
            <span className="font-medium">{record.activeInstances}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Completed:</span>
            <span className="font-medium">{record.completedInstances}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Avg. Time:</span>
            <span className="font-medium">{record.averageTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Success Rate:</span>
            <span className="font-medium text-green-600">{record.successRate}%</span>
          </div>
        </div>
      ),
    },
    {
      title: "Created",
      key: "created",
      render: (_: any, record: any) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{record.createdBy}</div>
          <div className="text-xs text-gray-500">
            {new Date(record.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Edit Workflow">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showWorkflowModal(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          {record.status === "Active" ? (
            <Tooltip title="Pause Workflow">
              <Button
                type="text"
                icon={<PauseCircleOutlined />}
                className="text-orange-600 hover:text-orange-800"
              />
            </Tooltip>
          ) : record.status === "Paused" ? (
            <Tooltip title="Resume Workflow">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                className="text-green-600 hover:text-green-800"
              />
            </Tooltip>
          ) : null}
          <Tooltip title="Delete Workflow">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: "Delete Workflow?",
                  content: `This will permanently delete "${record.name}" and all its instances.`,
                  okText: "Yes, Delete",
                  okType: "danger",
                  cancelText: "Cancel",
                  onOk() {
                    console.log("Delete workflow");
                  },
                })
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const instanceColumns = [
    {
      title: "Instance",
      dataIndex: "instanceId",
      key: "instanceId",
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium text-blue-600">{text}</div>
          <div className="text-sm text-gray-500">{record.workflowName}</div>
        </div>
      ),
    },
    {
      title: "Initiator",
      dataIndex: "initiator",
      key: "initiator",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Current Step",
      dataIndex: "currentStep",
      key: "currentStep",
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => (
        <div className="w-24">
          <Progress 
            percent={progress} 
            size="small" 
            status={progress === 100 ? "success" : "active"}
          />
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "blue";
        if (status === "Completed") color = "green";
        if (status === "Failed") color = "red";
        if (status === "In Progress") color = "orange";
        
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string) => (
        <div className="text-sm">
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const tabItems = [
    {
      key: "workflows",
      label: (
        <span className="flex items-center gap-2">
          <DeploymentUnitOutlined />
          Workflow Templates
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Workflow Management</h3>
              <p className="text-gray-600">Create and manage automated workflows</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showWorkflowModal()}
              className="bg-blue-600"
            >
              Create Workflow
            </Button>
          </div>

          {/* Statistics Cards */}
          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Total Workflows"
                  value={workflows.length}
                  prefix={<DeploymentUnitOutlined className="text-blue-600" />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Active Workflows"
                  value={workflows.filter(w => w.status === "Active").length}
                  prefix={<PlayCircleOutlined className="text-green-600" />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Running Instances"
                  value={workflows.reduce((acc, w) => acc + w.activeInstances, 0)}
                  prefix={<ClockCircleOutlined className="text-orange-600" />}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card className="text-center">
                <Statistic
                  title="Completed Today"
                  value={8}
                  prefix={<CheckCircleOutlined className="text-purple-600" />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          <Table
            columns={workflowColumns}
            dataSource={workflows}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} workflows`,
            }}
          />
        </div>
      ),
    },
    {
      key: "instances",
      label: (
        <span className="flex items-center gap-2">
          <BranchesOutlined />
          Active Instances
        </span>
      ),
      children: (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800">Workflow Instances</h3>
            <p className="text-gray-600">Monitor and manage running workflow instances</p>
          </div>

          <Table
            columns={instanceColumns}
            dataSource={workflowInstances}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} instances`,
            }}
          />
        </div>
      ),
    },
    {
      key: "analytics",
      label: (
        <span className="flex items-center gap-2">
          <AuditOutlined />
          Analytics
        </span>
      ),
      children: (
        <div>
          <Alert
            message="Workflow Analytics Dashboard"
            description="Comprehensive analytics and performance metrics for all workflows."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <Row gutter={16} className="mb-6">
            <Col xs={24} lg={12}>
              <Card title="Top Performing Workflows" className="h-full">
                <div className="space-y-4">
                  {workflows
                    .sort((a, b) => b.successRate - a.successRate)
                    .slice(0, 3)
                    .map((workflow, index) => (
                      <div key={workflow.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{workflow.name}</div>
                            <div className="text-sm text-gray-500">{workflow.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">{workflow.successRate}%</div>
                          <div className="text-sm text-gray-500">{workflow.completedInstances} completed</div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Recent Activity" className="h-full">
                <Timeline
                  items={[
                    {
                      dot: <CheckCircleOutlined className="text-green-500" />,
                      children: (
                        <div>
                          <div className="font-medium">Document Approval Completed</div>
                          <div className="text-sm text-gray-500">Instance WF-2024-003 completed successfully</div>
                          <div className="text-xs text-gray-400">2 hours ago</div>
                        </div>
                      ),
                    },
                    {
                      dot: <SendOutlined className="text-blue-500" />,
                      children: (
                        <div>
                          <div className="font-medium">New Workflow Instance Started</div>
                          <div className="text-sm text-gray-500">Employee Onboarding for Jane Smith</div>
                          <div className="text-xs text-gray-400">4 hours ago</div>
                        </div>
                      ),
                    },
                    {
                      dot: <ExclamationCircleOutlined className="text-orange-500" />,
                      children: (
                        <div>
                          <div className="font-medium">Workflow Paused</div>
                          <div className="text-sm text-gray-500">IT Change Request workflow paused for maintenance</div>
                          <div className="text-xs text-gray-400">6 hours ago</div>
                        </div>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Workflow Management
          </h1>
          <p className="text-gray-600">Design, deploy, and monitor automated workflows</p>
        </div>
        <div className="flex items-center">
          <Image
            src="/departments-illustration.svg"
            alt="Workflows"
            width={100}
            height={100}
            className="hidden md:block"
          />
        </div>
      </div>

      <Card className="shadow-md">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Workflow Creation/Edit Modal */}
      <Modal
        title={editingWorkflow ? "Edit Workflow" : "Create New Workflow"}
        open={isWorkflowModalVisible}
        onOk={handleWorkflowOk}
        onCancel={handleWorkflowCancel}
        okText={editingWorkflow ? "Update" : "Create"}
        okButtonProps={{ className: "bg-blue-600" }}
        width={700}
      >
        <Form form={form} layout="vertical" name="workflow_form" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Workflow Name"
                rules={[{ required: true, message: "Please enter workflow name" }]}
              >
                <Input placeholder="Enter workflow name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Workflow Type"
                rules={[{ required: true, message: "Please select workflow type" }]}
              >
                <Select placeholder="Select workflow type">
                  {workflowTypes.map(type => (
                    <Select.Option key={type} value={type}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={3} placeholder="Enter workflow description" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Initial Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              {workflowStatuses.map(status => (
                <Select.Option key={status} value={status}>
                  {status}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Workflow Configuration</Divider>

          <Alert
            message="Workflow Steps"
            description="Use the workflow designer to create and configure workflow steps after saving the basic information."
            type="info"
            showIcon
            className="mb-4"
          />

          <Form.Item
            name="autoStart"
            label="Auto Start"
            valuePropName="checked"
          >
            <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
          </Form.Item>

          <Form.Item
            name="notifications"
            label="Enable Notifications"
            valuePropName="checked"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminWorkflowsPage;