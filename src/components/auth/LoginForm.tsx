"use client";

import { useState } from "react";
import { Button, Checkbox, Form, Input, App } from "antd";
import {
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { AuthApi } from "@/lib/api";
import { useAuth } from "@/lib/authProvider";

type LoginValues = { email: string; password: string; remember?: boolean };

export default function LoginForm() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values: LoginValues) => {
    try {
      setLoading(true);
      
      // For the mock login case, use our centralized login function
      if (values.email === "admin@docuflow.com") {
        try {
          message.success("Login successful", 5);
          
          const redirectListener = (event: Event) => {
            const customEvent = event as CustomEvent;
          };
          window.addEventListener('auth-redirect', redirectListener);
          
          const fallbackTimer = setTimeout(() => {
            window.removeEventListener('auth-redirect', redirectListener);
            window.location.href = '/admin/dashboard?fallback=true';
          }, 3000);
          
          await login(values.email, values.password);
          
          clearTimeout(fallbackTimer);
          window.removeEventListener('auth-redirect', redirectListener);
        } catch (mockError) {
          message.error("Mock login failed. Please try again.");
        }
        return;
      }
      
      // For real API login
      const response = await AuthApi.login({
        email: values.email,
        password: values.password,
      });
      
      const apiData = response.data;
      
      // Validate the response data before proceeding
      if (!apiData?.accessToken || !apiData?.user || !apiData?.user.role) {
        throw new Error("Login response missing required authentication data");
      }
      
      // Show success message
      message.success("Login successful", 5);
      
      const redirectListener = (event: Event) => {
        const customEvent = event as CustomEvent;
      };
      window.addEventListener('auth-redirect', redirectListener);
      
      const fallbackTimer = setTimeout(() => {
        window.removeEventListener('auth-redirect', redirectListener);
        
        const role = apiData.user?.role?.toLowerCase() || 'employee';
        const fallbackUrl = role === 'manager' 
          ? `/department/dashboard?fallback=true&ts=${Date.now()}`
          : `/${role}/dashboard?fallback=true&ts=${Date.now()}`;
        window.location.href = fallbackUrl;
      }, 3000);
      
      // Do a direct hard redirect instead of waiting for the auth provider
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('docuflow_access_token', apiData.accessToken);
          localStorage.setItem('docuflow_refresh_token', apiData.refreshToken);
          localStorage.setItem('docuflow_user', JSON.stringify(apiData.user));
          
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `auth=true; path=/; expires=${expires}; SameSite=Lax`;
          document.cookie = `user_role=${apiData.user.role}; path=/; expires=${expires}; SameSite=Lax`;
          document.cookie = `x-user-role=${apiData.user.role}; path=/; expires=${expires}; SameSite=Lax`;
          
          const role = apiData.user?.role?.toLowerCase() || 'employee';
          const redirectUrl = role === 'manager'
            ? `/department/dashboard?auth=direct&ts=${Date.now()}`
            : `/${role}/dashboard?auth=direct&ts=${Date.now()}`;
          
          window.location.replace(redirectUrl);
          
          setTimeout(() => {
            document.write(`<html><body>Redirecting to dashboard...</body><script>window.location.href="${redirectUrl}";</script></html>`);
            window.location.reload();
          }, 1500);
        }
        
        login(apiData.user.email, "", apiData.accessToken, apiData.refreshToken, apiData.user)
          .catch(() => {});
        
        clearTimeout(fallbackTimer);
        window.removeEventListener('auth-redirect', redirectListener);
      } catch (error) {
        clearTimeout(fallbackTimer);
        window.removeEventListener('auth-redirect', redirectListener);
        throw error;
      }
    } catch (err: any) {
      
      if (err.response?.status === 401) {
        message.error("Invalid email or password", 8);
        return;
      }
      
      if (err.response && err.response.data) {
        let errorMessage = err.response.data.message || "Login failed";
        
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          if (errors.email) errorMessage += `\nEmail: ${errors.email.join(', ')}`;
          if (errors.password) errorMessage += `\nPassword: ${errors.password.join(', ')}`;
          if (errors.general) errorMessage += `\n${errors.general.join(', ')}`;
        }
        
        message.error(errorMessage, 6);
      } else {
        const errorMessage = err?.message || "Login failed. Please try again.";
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Form
        name="login"
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        size="large"
        className="space-y-1"
      >
        <Form.Item
          label={
            <span className="text-gray-700 font-medium">Email Address</span>
          }
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Email is invalid" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400 mr-2" />}
            placeholder="Enter your email"
            autoComplete="email"
            className="rounded-md py-2 px-3"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-gray-700 font-medium">Password</span>}
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400 mr-2" />}
            placeholder="Enter your password"
            autoComplete="current-password"
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            className="rounded-md py-2 px-3"
          />
        </Form.Item>

        <div className="flex items-center justify-between my-1">
          <Form.Item name="remember" valuePropName="checked" className="m-0">
            <Checkbox className="text-gray-600">Remember me</Checkbox>
          </Form.Item>
          <Link
            href="/forgot-password"
            className="text-sm text-orange-500 hover:text-orange-600 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Form.Item className="mt-6 mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="bg-orange-500 hover:!bg-orange-600 h-12 text-base font-medium rounded-md"
          >
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <div className="relative my-6">
        <div className="flex items-center gap-2">
          <span className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm font-medium">OR</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>
      </div>

      <Button
        icon={<GoogleOutlined className="text-lg" />}
        className="w-full h-12 rounded-md flex items-center justify-center border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        onClick={() => (window.location.href = AuthApi.googleUrl())}
      >
        <span className="ml-2 text-gray-700 font-medium">
          Continue with Google
        </span>
      </Button>
    </div>
  );
}
