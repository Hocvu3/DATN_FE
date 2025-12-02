"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  message,
  Space,
  Card,
  Divider,
  Switch,
  Avatar,
  List,
  Tag,
  Badge,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  BellOutlined,
  UploadOutlined,
  SaveOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
// import { UsersApi } from "@/lib/api";

const { Title, Paragraph, Text } = Typography;

// Sample notification preferences
const NOTIFICATION_PREFERENCES = [
  {
    key: "document_upload",
    label: "Document uploads",
    description: "When new documents are uploaded in your departments",
  },
  {
    key: "document_approval",
    label: "Approval requests",
    description: "When you are requested to approve a document",
  },
  {
    key: "comment_mention",
    label: "Comment mentions",
    description: "When someone mentions you in a comment",
  },
  {
    key: "document_shared",
    label: "Shared documents",
    description: "When a document is shared with you",
  },
];

// Sample security events
const SECURITY_EVENTS = [
  {
    type: "login",
    timestamp: "2025-09-25T08:32:15Z",
    details: "Successful login",
    ip: "192.168.1.45",
    location: "New York, USA",
    device: "Chrome on Windows",
  },
  {
    type: "password_change",
    timestamp: "2025-09-20T14:15:33Z",
    details: "Password changed",
    ip: "192.168.1.45",
    location: "New York, USA",
    device: "Chrome on Windows",
  },
  {
    type: "failed_login",
    timestamp: "2025-09-15T11:42:08Z",
    details: "Failed login attempt",
    ip: "157.240.192.35",
    location: "Unknown Location",
    device: "Unknown Device",
  },
  {
    type: "login",
    timestamp: "2025-09-15T10:24:51Z",
    details: "Successful login",
    ip: "192.168.1.45",
    location: "New York, USA",
    device: "Safari on macOS",
  },
];

export default function ProfileSettings() {
  // State
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [currentTab, setCurrentTab] = useState("profile");
  const [userProfile, setUserProfile] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    phone: "+1 (555) 123-4567",
    jobTitle: "Senior Document Manager",
    department: "Operations",
    twoFactorEnabled: true,
  });

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // In production, fetch real user data
        // const user = await UsersApi.getCurrentUserProfile();
        // setUserProfile(user);

        // For development, we'll use the mock data
        setTimeout(() => {
          profileForm.setFieldsValue({
            name: userProfile.name,
            email: userProfile.email,
            phone: userProfile.phone,
            jobTitle: userProfile.jobTitle,
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        message.error("Failed to load profile. Please try again.");
        setLoading(false);
      }
    };

    loadProfile();
  }, [
    profileForm,
    userProfile.email,
    userProfile.jobTitle,
    userProfile.name,
    userProfile.phone,
  ]);

  // Handle profile update
  const handleProfileUpdate = async (values: any) => {
    setLoading(true);
    try {
      // In production, send to API
      // await UsersApi.updateProfile(values);

      // For development
      setTimeout(() => {
        setUserProfile((prev) => ({
          ...prev,
          ...values,
        }));
        setLoading(false);
        message.success("Profile updated successfully!");
      }, 1000);
    } catch (error) {
      message.error("Failed to update profile. Please try again.");
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    setLoading(true);
    try {
      // In production, send to API
      // await UsersApi.changePassword(values);

      // For development
      setTimeout(() => {
        passwordForm.resetFields();
        setLoading(false);
        message.success("Password changed successfully!");
      }, 1000);
    } catch (error) {
      message.error("Failed to change password. Please try again.");
      setLoading(false);
    }
  };

  // Handle notification preference toggle
  const handleNotificationToggle = (key: string, enabled: boolean) => {
    message.success(`Notification preference updated!`);
  };

  // Handle 2FA toggle
  const handleTwoFactorToggle = (enabled: boolean) => {
    setUserProfile((prev) => ({
      ...prev,
      twoFactorEnabled: enabled,
    }));
    message.success(
      `Two-factor authentication ${enabled ? "enabled" : "disabled"}!`
    );
  };

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Title level={2} className="!text-gray-800">
            Department Manager Profile
          </Title>
          <Paragraph className="text-gray-600">
            Manage your personal information, security settings, and
            notification preferences.
          </Paragraph>
        </div>

        <Card className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar
              src={userProfile.avatar}
              size={80}
              icon={<UserOutlined />}
              className="border-2 border-gray-100"
            />
            <div className="flex-grow">
              <Title level={4} className="!text-gray-800 !mb-1">
                {userProfile.name}
              </Title>
              <Text className="text-gray-500 block mb-2">
                {userProfile.email}
              </Text>
              <div className="flex items-center gap-2">
                <Tag color="blue">{userProfile.department}</Tag>
                <Tag color="green">{userProfile.jobTitle}</Tag>
              </div>
            </div>
          </div>
        </Card>

        <Tabs
          activeKey={currentTab}
          onChange={setCurrentTab}
          items={[
            {
              label: (
                <span>
                  <UserOutlined />
                  Profile
                </span>
              ),
              key: "profile",
              children: (
                <Card>
                  <Title level={4} className="!text-gray-800 mb-4">
                    Personal Information
                  </Title>
                  <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleProfileUpdate}
                  >
                    <Form.Item name="avatar" label="Profile Picture">
                      <Upload
                        listType="picture"
                        maxCount={1}
                        showUploadList={false}
                        beforeUpload={() => false}
                      >
                        <div className="flex items-center">
                          <Avatar
                            src={userProfile.avatar}
                            size={64}
                            icon={<UserOutlined />}
                          />
                          <Button
                            type="primary"
                            icon={<UploadOutlined />}
                            className="ml-4"
                          >
                            Change Photo
                          </Button>
                        </div>
                      </Upload>
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your name",
                          },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined className="text-gray-400" />}
                          placeholder="Your full name"
                        />
                      </Form.Item>

                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your email",
                          },
                          {
                            type: "email",
                            message: "Please enter a valid email",
                          },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined className="text-gray-400" />}
                          placeholder="Your email address"
                          readOnly
                          className="bg-gray-50"
                        />
                      </Form.Item>

                      <Form.Item name="phone" label="Phone Number">
                        <Input placeholder="Your phone number" />
                      </Form.Item>

                      <Form.Item name="jobTitle" label="Job Title">
                        <Input placeholder="Your job title" />
                      </Form.Item>
                    </div>

                    <Divider />

                    <div className="flex justify-end">
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </Form>
                </Card>
              ),
            },
            {
              label: (
                <span>
                  <LockOutlined />
                  Security
                </span>
              ),
              key: "security",
              children: (
                <div className="space-y-6">
                  <Card>
                    <Title level={4} className="!text-gray-800 mb-4">
                      Change Password
                    </Title>
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handlePasswordChange}
                    >
                      <Form.Item
                        name="currentPassword"
                        label="Current Password"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your current password",
                          },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="Your current password"
                        />
                      </Form.Item>

                      <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your new password",
                          },
                          {
                            min: 8,
                            message: "Password must be at least 8 characters",
                          },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="Your new password"
                        />
                      </Form.Item>

                      <Form.Item
                        name="confirmPassword"
                        label="Confirm New Password"
                        dependencies={["newPassword"]}
                        rules={[
                          {
                            required: true,
                            message: "Please confirm your new password",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue("newPassword") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("The two passwords do not match")
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-gray-400" />}
                          placeholder="Confirm your new password"
                        />
                      </Form.Item>

                      <div className="flex justify-end">
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          loading={loading}
                        >
                          Change Password
                        </Button>
                      </div>
                    </Form>
                  </Card>

                  <Card>
                    <div className="flex items-center justify-between">
                      <div>
                        <Title level={4} className="!text-gray-800 !mb-1">
                          Two-Factor Authentication
                        </Title>
                        <Paragraph className="text-gray-600">
                          Add an extra layer of security to your account by
                          requiring a verification code.
                        </Paragraph>
                      </div>
                      <Switch
                        checked={userProfile.twoFactorEnabled}
                        onChange={handleTwoFactorToggle}
                      />
                    </div>

                    {userProfile.twoFactorEnabled && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <Text strong>
                          Two-factor authentication is enabled.
                        </Text>
                        <Paragraph className="mb-0 mt-1">
                          You will receive a verification code via email when
                          signing in from a new device.
                        </Paragraph>
                      </div>
                    )}
                  </Card>

                  <Card>
                    <Title level={4} className="!text-gray-800 mb-4">
                      Recent Security Activity
                    </Title>
                    <List
                      dataSource={SECURITY_EVENTS}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              item.type === "failed_login" ? (
                                <Badge status="error">
                                  <ExclamationCircleOutlined
                                    style={{
                                      fontSize: "24px",
                                      color: "#ff4d4f",
                                    }}
                                  />
                                </Badge>
                              ) : (
                                <Badge status="success">
                                  <CheckCircleOutlined
                                    style={{
                                      fontSize: "24px",
                                      color: "#52c41a",
                                    }}
                                  />
                                </Badge>
                              )
                            }
                            title={item.details}
                            description={
                              <div className="text-gray-500">
                                <div>
                                  {new Date(item.timestamp).toLocaleString()}
                                </div>
                                <div>
                                  {item.device} • {item.ip} • {item.location}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </div>
              ),
            },
            {
              label: (
                <span>
                  <BellOutlined />
                  Notifications
                </span>
              ),
              key: "notifications",
              children: (
                <Card>
                  <Title level={4} className="!text-gray-800 mb-4">
                    Notification Preferences
                  </Title>
                  <List
                    dataSource={NOTIFICATION_PREFERENCES}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Switch
                            key={item.key}
                            defaultChecked
                            onChange={(checked) =>
                              handleNotificationToggle(item.key, checked)
                            }
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          title={item.label}
                          description={item.description}
                        />
                      </List.Item>
                    )}
                  />

                  <Divider />

                  <Title level={4} className="!text-gray-800 mb-4">
                    Email Notifications
                  </Title>
                  <Space direction="vertical" className="w-full">
                    <div className="flex items-center justify-between">
                      <Text>Send daily digest email</Text>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Text>Send weekly activity summary</Text>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Text>Send system updates and announcements</Text>
                      <Switch defaultChecked />
                    </div>
                  </Space>
                </Card>
              ),
            },
          ]}
        />

        <Card className="mt-8 border-red-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Title level={4} className="!text-gray-800 !mb-1">
                Delete Account
              </Title>
              <Paragraph className="text-gray-600 mb-0">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </Paragraph>
            </div>
            <Button danger icon={<DeleteOutlined />}>
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
