"use client";

import { useState } from "react";
import { Button, Form, Input, Typography, Space, App } from "antd";
import {
  MailOutlined,
  ArrowLeftOutlined,
  FileTextFilled,
  SafetyOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { AuthApi } from "@/lib/api";

const { Title, Paragraph, Text } = Typography;

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

export default function ForgotPasswordPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    setError("");

    try {
      const result = await AuthApi.forgotPassword(values.email);
      console.log('Forgot password result:', result);
      
      // Get message from backend response
      const successMessage = (result as any)?.message || (result as any)?.data?.message || "Password reset instructions sent to your email!";
      
      setEmailSent(true);
      message.success(successMessage, 5);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      let errorMessage = "Failed to send reset email. Please try again.";
      
      // Handle validation errors
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.property) {
          errorMessage = errors.message || errors.property[0];
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      message.error(errorMessage, 6);
    } finally {
      setLoading(false);
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
              Reset your password to regain access to your account and continue
              managing your documents securely.
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
              <ArrowLeftOutlined className="mr-1" /> Back to login
            </Link>
          </div>

          {emailSent ? (
            <div className="text-center py-6">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <Title level={3} className="!text-gray-800 mb-3">
                Check your inbox
              </Title>

              <Paragraph className="text-gray-600 mb-8">
                We&apos;ve sent password reset instructions to{" "}
                <Text strong>{form.getFieldValue("email")}</Text>. Please check
                your email and follow the link to reset your password.
              </Paragraph>

              <Space direction="vertical" className="w-full">
                <Button
                  type="primary"
                  block
                  href="/login"
                  className="bg-orange-500 hover:!bg-orange-600"
                >
                  Return to Login
                </Button>
                <Button type="link" onClick={() => setEmailSent(false)}>
                  Didn&apos;t receive the email? Try again
                </Button>
              </Space>
            </div>
          ) : (
            <>
              <Title level={3} className="!text-gray-800 mb-2">
                Forgot Password
              </Title>

              <Paragraph className="text-gray-600 mb-6">
                Enter your email address below and we&apos;ll send you instructions
                to reset your password.
              </Paragraph>

              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your email address",
                    },
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="Email address"
                    size="large"
                  />
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
                    Send Reset Instructions
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
