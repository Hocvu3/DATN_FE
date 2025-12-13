"use client";

import { useState, useEffect, Suspense } from "react";
import { Button, Form, Input, Typography, Result, App, Alert } from "antd";
import {
  LockOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  FileTextFilled,
  SafetyOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthApi } from "@/lib/api";

const { Title, Paragraph } = Typography;

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [error, setError] = useState("");
  const [isValidToken, setIsValidToken] = useState(true);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Check if token and email are present
  useEffect(() => {
    if (!token || !email) {
      setIsValidToken(false);
      setError(
        "Missing password reset token or email. Please request a new password reset link."
      );
    } else {
      setIsValidToken(true);
    }
  }, [token, email]);

  const handleSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!token || !email) {
      setError("Missing token or email. Please request a new reset link.");
      message.error("Missing token or email. Please request a new reset link.", 6);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await AuthApi.resetPassword({
        email,
        token,
        newPassword: values.password,
      });
      
      console.log('Reset password result:', result);
      
      // Get message from backend response
      const successMessage = (result as any)?.data?.message || (result as any)?.message || "Password reset successfully! You can now login with your new password.";
      
      message.success(successMessage, 5);
      setResetComplete(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      let errorMessage = "Failed to reset password. Please try again or request a new reset link.";
      
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

  const renderContent = () => {
    if (!isValidToken) {
      return (
        <Alert
          message="Invalid Reset Link"
          description={error}
          type="error"
          action={
            <Button
              size="small"
              type="primary"
              className="bg-orange-500 hover:!bg-orange-600"
            >
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          }
        />
      );
    }

    if (resetComplete) {
      return (
        <Result
          icon={<CheckCircleFilled className="text-green-500" />}
          title="Password Reset Complete"
          subTitle="Your password has been successfully reset."
          extra={
            <Button
              type="primary"
              size="large"
              className="bg-orange-500 hover:!bg-orange-600"
            >
              <Link href="/login">Sign in with your new password</Link>
            </Button>
          }
        />
      );
    }

    return (
      <>
        <Title level={3} className="!text-gray-800 mb-2">
          Reset Your Password
        </Title>

        <Paragraph className="text-gray-600 mb-6">
          Enter your new password below to complete the password reset process.
        </Paragraph>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="New password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your new password" },
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
              placeholder="Confirm new password"
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
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </>
    );
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
              Create a strong new password to keep your document management
              account secure.
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

          {renderContent()}
        </div>
      </section>
    </main>
  );
}
