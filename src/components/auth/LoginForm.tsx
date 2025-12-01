"use client";

import { useState } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
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
import Toast from "@/components/common/Toast";

type LoginValues = { email: string; password: string; remember?: boolean };

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values: LoginValues) => {
    console.log('Login submitted with:', { email: values.email, passwordLength: values.password?.length });
    try {
      setLoading(true);
      
      // For the mock login case, use our centralized login function
      if (values.email === "admin@docuflow.com") {
        console.log('Using mock login for admin@docuflow.com');
        try {
          // Show success message immediately
          Toast.success("Login successful", 5);
          message.success("Login successful");
          
          // Listen for redirect events
          const redirectListener = (event: Event) => {
            const customEvent = event as CustomEvent;
            console.log('Redirect event received:', customEvent.detail);
          };
          window.addEventListener('auth-redirect', redirectListener);
          
          // Add a fallback redirect timer in case the login function doesn't redirect
          const fallbackTimer = setTimeout(() => {
            console.log('Fallback redirect timer triggered');
            window.removeEventListener('auth-redirect', redirectListener);
            window.location.href = '/admin/dashboard?fallback=true';
          }, 3000);
          
          // Call login function
          await login(values.email, values.password);
          console.log('Mock login successful, awaiting redirect');
          
          // Clear fallback timer
          clearTimeout(fallbackTimer);
          window.removeEventListener('auth-redirect', redirectListener);
        } catch (mockError) {
          console.error('Mock login failed:', mockError);
          Toast.error("Mock login failed. Please try again.");
          message.error("Mock login failed. Please try again.");
        }
        return;
      }
      
      // For real API login
      console.log('Calling AuthApi.login...');
      const response = await AuthApi.login({
        email: values.email,
        password: values.password,
      });
      console.log('Login API response received:', response);
      
      // The API client now handles the response structure normalization
      const apiData = response.data;
      console.log('API data extracted:', apiData);
      
      // Log important authentication information
      console.log('Login response data:', {
        hasAccessToken: !!apiData?.accessToken,
        hasRefreshToken: !!apiData?.refreshToken,
        hasUserData: !!apiData?.user,
        userRole: apiData?.user?.role
      });
      
      // Validate the response data before proceeding
      if (!apiData?.accessToken || !apiData?.user || !apiData?.user.role) {
        console.error("Invalid login response - missing required data:", {
          apiData,
          hasAccessToken: !!apiData?.accessToken,
          hasUser: !!apiData?.user,
          hasRole: !!apiData?.user?.role
        });
        console.error("Full response structure:", response);
        throw new Error("Login response missing required authentication data");
      }
      
      // Show success message using multiple methods to ensure visibility
      const successMessage = "Login successful";
      
      // Use different notification methods for redundancy
      try {
        Toast.success(successMessage, 5);
        message.success(successMessage);
        
        // Fire custom events for any listeners
        if (typeof window !== 'undefined') {
          try {
            // Standard notification event
            const event = new CustomEvent('showNotification', {
              detail: { type: 'success', message: successMessage, duration: 5 }
            });
            window.dispatchEvent(event);
            
            // Specific login success event
            const loginSuccessEvent = new CustomEvent('login-success', {
              detail: { 
                message: successMessage,
                userData: apiData.user
              }
            });
            window.dispatchEvent(loginSuccessEvent);
          } catch (e) {
            console.error("Failed to dispatch events:", e);
          }
        }
      } catch (e) {
        console.error("Error showing success notifications:", e);
      }
      
      // Now use the centralized login function to handle auth state
      console.log('Passing login data to auth provider', {
        email: apiData.user.email,
        role: apiData.user.role,
        tokenLength: apiData.accessToken.length
      });
      
      // Listen for redirect events
      const redirectListener = (event: Event) => {
        const customEvent = event as CustomEvent;
        console.log('Redirect event received:', customEvent.detail);
      };
      window.addEventListener('auth-redirect', redirectListener);
      
      // Add a fallback redirect timer in case the login function doesn't redirect
      const fallbackTimer = setTimeout(() => {
        console.log('API login fallback redirect timer triggered');
        window.removeEventListener('auth-redirect', redirectListener);
        
        // Determine where to redirect based on role
        const role = apiData.user?.role?.toLowerCase() || 'employee';
        // Special case: MANAGER redirects to /department/dashboard instead of /manager/dashboard
        const fallbackUrl = role === 'manager' 
          ? `/department/dashboard?fallback=true&ts=${Date.now()}`
          : `/${role}/dashboard?fallback=true&ts=${Date.now()}`;
        console.log(`Fallback redirecting to ${fallbackUrl}`);
        window.location.href = fallbackUrl;
      }, 3000);
      
      // Do a direct hard redirect instead of waiting for the auth provider
      try {
        // Set the authentication directly for immediate effect
        if (typeof window !== 'undefined') {
          // Store tokens in localStorage for persistence
          localStorage.setItem('docuflow_access_token', apiData.accessToken);
          localStorage.setItem('docuflow_refresh_token', apiData.refreshToken);
          localStorage.setItem('docuflow_user', JSON.stringify(apiData.user));
          
          // Set cookies directly for immediate effect
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `auth=true; path=/; expires=${expires}; SameSite=Lax`;
          document.cookie = `user_role=${apiData.user.role}; path=/; expires=${expires}; SameSite=Lax`;
          document.cookie = `x-user-role=${apiData.user.role}; path=/; expires=${expires}; SameSite=Lax`;
          
          // Determine where to redirect based on role
          const role = apiData.user?.role?.toLowerCase() || 'employee';
          // Special case: MANAGER redirects to /department/dashboard instead of /manager/dashboard
          const redirectUrl = role === 'manager'
            ? `/department/dashboard?auth=direct&ts=${Date.now()}`
            : `/${role}/dashboard?auth=direct&ts=${Date.now()}`;
          
          console.log(`Direct redirecting to ${redirectUrl}`);
          
          // Use the most aggressive redirect approach
          window.location.replace(redirectUrl);
          
          // As a desperate fallback, use document.write
          setTimeout(() => {
            document.write(`<html><body>Redirecting to dashboard...</body><script>window.location.href="${redirectUrl}";</script></html>`);
            window.location.reload();
          }, 1500);
        }
        
        // Call the login function also, but don't wait for it since we're doing direct redirect
        login(apiData.user.email, "", apiData.accessToken, apiData.refreshToken, apiData.user)
          .catch(e => console.error("Background login process error:", e));
        
        // Clean up
        clearTimeout(fallbackTimer);
        window.removeEventListener('auth-redirect', redirectListener);
      } catch (error) {
        // Clear timers and listeners
        clearTimeout(fallbackTimer);
        window.removeEventListener('auth-redirect', redirectListener);
        throw error; // Re-throw for the outer catch block
      }
    } catch (err: any) {
      // Handle login error with proper formatting
      console.error("Login error:", err);
      
      // Display login error directly (fallback)
      if (err.response?.status === 401) {
        const directErrorMsg = "Invalid email or password";
        // Use all error display methods to ensure at least one works
        
        try {
          Toast.error(directErrorMsg, 8);
          message.error(directErrorMsg);
          
          // Custom events
          if (typeof window !== 'undefined') {
            // Standard notification event
            const event = new CustomEvent('showNotification', {
              detail: { type: 'error', message: directErrorMsg, duration: 6 }
            });
            window.dispatchEvent(event);
            
            // Login-specific error event
            const loginEvent = new CustomEvent('login-error', {
              detail: { message: directErrorMsg }
            });
            window.dispatchEvent(loginEvent);
          }
        } catch (e) {
          console.error("Failed to show error notifications:", e);
        }
        
        return; // Don't process further
      }
      
      // Handle other cases if response data exists
      if (err.response && err.response.data) {
        // Format the error message from the API response
        let errorMessage = err.response.data.message || "Login failed";
        
        // Add validation errors if they exist
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          if (errors.email) errorMessage += `\nEmail: ${errors.email.join(', ')}`;
          if (errors.password) errorMessage += `\nPassword: ${errors.password.join(', ')}`;
          if (errors.general) errorMessage += `\n${errors.general.join(', ')}`;
        }
        
        // Display the error
        try {
          Toast.error(errorMessage, 6);
          message.error(errorMessage);
        } catch (e) {
          console.error("Failed to show error notifications:", e);
        }
      } else {
        // Fallback for network errors or other issues
        const errorMessage = err?.message || "Login failed. Please try again.";
        try {
          Toast.error(errorMessage);
          message.error(errorMessage);
        } catch (e) {
          console.error("Failed to show error notifications:", e);
        }
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
