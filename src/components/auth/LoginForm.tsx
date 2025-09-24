"use client";

import { useState } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { LockOutlined, MailOutlined, GoogleOutlined } from "@ant-design/icons";
import { AuthApi } from "@/lib/api";
import { saveAuthTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";

type LoginValues = { email: string; password: string; remember?: boolean };

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: LoginValues) => {
    try {
      setLoading(true);
      const { data } = await AuthApi.login({
        email: values.email,
        password: values.password,
      });
      saveAuthTokens(data.accessToken, data.refreshToken);
      message.success("Signed in successfully");
      router.push("/");
    } catch (err: any) {
      message.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <Form name="login" layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Email is invalid" },
          ]}
        >
          <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Enter your email" size="large" autoComplete="email" />
        </Form.Item>

        <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password" }]}>
          <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Enter your password" size="large" autoComplete="current-password" />
        </Form.Item>

        <div className="flex items-center justify-between pb-2">
          <Form.Item name="remember" valuePropName="checked" className="m-0">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <a href="#" className="text-sm text-orange-500 hover:underline">
            Forgot password?
          </a>
        </div>

        <Form.Item className="mb-0">
          <Button type="primary" htmlType="submit" loading={loading} size="large" className="bg-orange-500 hover:!bg-orange-600 w-full">
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <div className="relative my-6">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="flex-1 h-px bg-gray-200" />
          OR
          <span className="flex-1 h-px bg-gray-200" />
        </div>
      </div>

      <Button icon={<GoogleOutlined />} size="large" className="w-full" onClick={() => (window.location.href = AuthApi.googleUrl())}>
        Continue with Google
      </Button>
    </div>
  );
}


