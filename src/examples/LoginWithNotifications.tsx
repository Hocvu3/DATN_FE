// Example of using Toast and NotificationModal in the Login page
// You can integrate this into your existing Login page

import React from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import Toast from "@/components/common/Toast";
import { useApi } from "@/hooks/useApi";
import { useNotificationModal } from "@/components/common/NotificationModal";
import ApiService from "@/utils/api";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

const LoginExample: React.FC = () => {
  const router = useRouter();
  const { loading, execute } = useApi();
  const { showModal, notificationModal } = useNotificationModal();

  // Handle login
  const handleLogin = async (values: LoginFormValues) => {
    // Use execute hook with loading notification
    const result = await execute(
      async () => {
        // Call login API
        const response = await ApiService.post(
          "/auth/login",
          {
            email: values.email,
            password: values.password,
          },
          {
            // Don't show success message here as we will display a custom notification
            showSuccessMessage: false,
          }
        );

        // Save token
        if (response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
          if (response.refreshToken) {
            localStorage.setItem("refreshToken", response.refreshToken);
          }
        }

        return response;
      },
      {
        loadingMessage: "Logging in...",
        errorMessage: "Login failed. Please check your credentials.",
      }
    );

    if (result) {
      // Show success notification with modal if it's first login
      const isFirstLogin = result.isFirstLogin;

      if (isFirstLogin) {
        showModal(
          "Welcome to DocuFlow!",
          "This is your first time logging into the system. Please change your password to start using the system.",
          "success",
          "Continue"
        );
      } else {
        // Show simple toast notification
        Toast.success("Login successful!");
      }

      // Redirect after successful login
      setTimeout(
        () => {
          router.push(`/${result.user.role}/dashboard`);
        },
        isFirstLogin ? 1500 : 300
      );
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (email: string) => {
    if (!email) {
      Toast.warning(
        "Please enter your email before requesting a password reset."
      );
      return;
    }

    try {
      // Show loading notification
      const loadingToast = Toast.loading("Sending password reset request...");

      await ApiService.post(
        "/auth/forgot-password",
        { email },
        {
          showSuccessMessage: false,
        }
      );

      // Close loading notification
      if (typeof loadingToast === "function") {
        loadingToast();
      }

      // Show notification modal
      showModal(
        "Request Sent",
        "We have sent an email with password reset instructions to your email address. Please check your inbox.",
        "info"
      );
    } catch (error: unknown) {
      // Errors will be handled automatically by ApiService
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login to DocuFlow
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure Document Management System
          </p>
        </div>

        <Form
          name="login"
          className="mt-8 space-y-6"
          initialValues={{ remember: true }}
          onFinish={handleLogin}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Invalid email format!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <div className="flex items-center justify-between">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Button
              type="link"
              onClick={() => {
                const email = (
                  document.querySelector(
                    'input[name="login_email"]'
                  ) as HTMLInputElement
                )?.value;
                handleForgotPassword(email);
              }}
            >
              Forgot password?
            </Button>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              size="large"
              loading={loading}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* Render notification modal component */}
      {notificationModal}
    </div>
  );
};

export default LoginExample;
