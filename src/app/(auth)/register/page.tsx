"use client";

import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Typography,
  Checkbox,
  Divider,
  Alert,
  Steps,
  Select,
  Space,
  Result,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  FileTextFilled,
  SafetyOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Link from "next/link";
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Sample departments
const DEPARTMENTS = [
  { value: "it", label: "Information Technology" },
  { value: "hr", label: "Human Resources" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing" },
  { value: "operations", label: "Operations" },
  { value: "legal", label: "Legal" },
  { value: "executive", label: "Executive" },
];

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-white/15 grid place-items-center text-xl shadow-lg">
        {icon}
      </div>
      <div className="text-lg font-medium">{title}</div>
    </div>
  );
}

export default function RegisterPage() {
  const [accountForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  // Steps configuration
  const steps = [
    {
      title: "Account",
      description: "Create account",
    },
    {
      title: "Profile",
      description: "Personal info",
    },
    {
      title: "Complete",
      description: "Review & finish",
    },
  ];

  const handleAccountSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // In production, call API
      // await AuthApi.register(accountForm.getFieldsValue());

      // For development
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentStep(1);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // In production, call API
      // await AuthApi.updateProfile(profileForm.getFieldsValue());

      // For development
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentStep(2);
    } catch {
      setError("Profile update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="mb-8">
              <Title level={3} className="!text-gray-800 mb-2">
                Create Your Account
              </Title>
              <Paragraph className="text-gray-600">
                Join DocuFlow to manage your documents securely.
              </Paragraph>
            </div>

            {error && (
              <Alert message={error} type="error" showIcon className="mb-6" />
            )}

            <Button
              block
              size="large"
              icon={<GoogleOutlined />}
              className="mb-6"
              onClick={() => {}}
            >
              Sign up with Google
            </Button>

            <Divider plain>
              <Text className="text-gray-400">or sign up with email</Text>
            </Divider>

            <Form
              form={accountForm}
              layout="vertical"
              onFinish={handleAccountSubmit}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Email address"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please enter a password" },
                  { min: 8, message: "Password must be at least 8 characters" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
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
                  placeholder="Confirm password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("You must accept the terms")
                          ),
                  },
                ]}
              >
                <Checkbox>
                  I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
                  <Link href="/privacy">Privacy Policy</Link>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  className="bg-orange-500 hover:!bg-orange-600"
                >
                  Continue
                </Button>
              </Form.Item>
            </Form>
          </>
        );

      case 1:
        return (
          <>
            <div className="mb-8">
              <Title level={3} className="!text-gray-800 mb-2">
                Complete Your Profile
              </Title>
              <Paragraph className="text-gray-600">
                Tell us a bit more about yourself to personalize your
                experience.
              </Paragraph>
            </div>

            {error && (
              <Alert message={error} type="error" showIcon className="mb-6" />
            )}

            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileSubmit}
            >
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "Please enter your first name" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="First Name"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { required: true, message: "Please enter your last name" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Last Name"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="department"
                label="Department"
                rules={[
                  { required: true, message: "Please select your department" },
                ]}
              >
                <Select placeholder="Select your department" size="large">
                  {DEPARTMENTS.map((dept) => (
                    <Option key={dept.value} value={dept.value}>
                      {dept.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="jobTitle"
                label="Job Title"
                rules={[
                  { required: true, message: "Please enter your job title" },
                ]}
              >
                <Input placeholder="Your job title" size="large" />
              </Form.Item>

              <Form.Item>
                <Space className="w-full">
                  <Button
                    onClick={() => setCurrentStep(0)}
                    size="large"
                    style={{ width: "120px" }}
                  >
                    Back
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    className="bg-orange-500 hover:!bg-orange-600"
                  >
                    Complete Registration
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        );

      case 2:
        return (
          <Result
            icon={
              <CheckCircleFilled
                className="text-green-500"
                style={{ fontSize: "72px" }}
              />
            }
            title="Registration Complete!"
            subTitle="Your account has been successfully created."
            extra={[
              <Button
                type="primary"
                size="large"
                key="dashboard"
                className="bg-orange-500 hover:!bg-orange-600"
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>,
              <Button key="login" size="large">
                <Link href="/login">Sign In</Link>
              </Button>,
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side - Branding area */}
      <section className="relative hidden md:flex flex-col justify-center text-white bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-20 bg-pattern"></div>
        <div className="relative z-10 px-12 lg:px-16 py-20 h-full flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-orange-500 grid place-items-center text-white text-3xl shadow-xl">
                <FileTextFilled />
              </div>
              <h1 className="text-5xl font-bold tracking-tight">DocuFlow</h1>
            </div>

            <h2 className="text-2xl font-medium mb-6">
              Document Management System
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed">
              Join thousands of professionals who trust DocuFlow to securely
              manage, share, and collaborate on their important documents.
            </p>

            <div className="mt-14 space-y-6">
              <Feature icon={<SafetyOutlined />} title="Secure & Encrypted" />
              <Feature icon={<TeamOutlined />} title="Team Collaboration" />
              <Feature icon={<AppstoreOutlined />} title="Smart Organization" />
            </div>
          </div>
        </div>
      </section>

      {/* Right side - Form */}
      <section className="flex items-center justify-center p-6 md:p-0 bg-gray-50">
        <div className="w-full max-w-md px-8 py-10 md:py-12 bg-white shadow-lg rounded-xl">
          <div className="mb-6">
            <Link
              href="/login"
              className="text-gray-600 hover:text-orange-500 flex items-center"
            >
              <ArrowLeftOutlined className="mr-1" /> Already have an account?
              Sign in
            </Link>
          </div>

          <Steps current={currentStep} items={steps} className="mb-8" />

          {renderStepContent()}

          {currentStep === 0 && (
            <div className="mt-6 text-center">
              <Text className="text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-orange-500 hover:text-orange-600"
                >
                  Sign in
                </Link>
              </Text>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
