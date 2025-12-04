"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Button,
  Form,
  Input,
  Typography,
  App,
  Result,
  notification,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  FileTextFilled,
  SafetyOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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

function RegisterContent() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (!tokenParam || !emailParam) {
      setIsValidToken(false);
      message.error("Invalid registration link. Please check your invitation email.", 6);
    } else {
      setToken(tokenParam);
      setEmail(emailParam);
      form.setFieldValue("email", emailParam);
    }
  }, [searchParams, form, message]);

  const handleSubmit = async (values: any) => {
    if (!token || !email) {
      message.error("Invalid registration link", 6);
      return;
    }

    setLoading(true);

    try {
      const result = await AuthApi.completeRegistration({
        email,
        token,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      if (result.success) {
        const successMessage = result.data?.message || result.data?.data?.message || "Registration completed successfully!";
        notification.success({
          message: 'Success',
          description: successMessage,
          placement: 'topRight',
          duration: 5,
        });
        setRegistrationComplete(true);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const errorMessage = result.data?.message || "Registration failed. Please try again.";
        message.error(errorMessage, 6);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage, 6);
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <Result
        status="error"
        title="Invalid Registration Link"
        subTitle="This registration link is invalid or has expired. Please contact your administrator for a new invitation."
        extra={
          <Button type="primary" className="bg-orange-500 hover:!bg-orange-600">
            <Link href="/login">Go to Login</Link>
          </Button>
        }
      />
    );
  }

  if (registrationComplete) {
    return (
      <Result
        status="success"
        icon={<CheckCircleFilled className="text-green-500" style={{ fontSize: "72px" }} />}
        title="Registration Complete!"
        subTitle="Your account has been successfully created. Redirecting to login..."
        extra={
          <Button type="primary" className="bg-orange-500 hover:!bg-orange-600">
            <Link href="/login">Go to Login</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="mb-8">
        <Title level={3} className="!text-gray-800 mb-2">
          Complete Your Registration
        </Title>
        <Paragraph className="text-gray-600">
          Set your password and complete your profile to get started.
        </Paragraph>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="email"
          label="Email"
        >
          <Input
            disabled
            size="large"
            className="bg-gray-50"
          />
        </Form.Item>

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
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please enter a password" },
            { min: 6, message: "Password must be at least 6 characters" },
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
          label="Confirm Password"
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

        <Form.Item>
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
        </Form.Item>
      </Form>
    </>
  );
}
export default function RegisterPage() {
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
              <ArrowLeftOutlined className="mr-1" /> Back to login
            </Link>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <RegisterContent />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
