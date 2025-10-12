"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spin, Alert, Button, message } from "antd";
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get URL parameters from backend redirect
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const userData = searchParams.get('user');
        const error = searchParams.get('error');

        // Check for error parameter
        if (error) {
          throw new Error(decodeURIComponent(error));
        }

        // Validate required parameters
        if (!accessToken || !userData) {
          throw new Error('Missing authentication data from Google login');
        }

        // Parse user data
        let user;
        try {
          user = JSON.parse(decodeURIComponent(userData));
        } catch {
          throw new Error('Invalid user data format');
        }

        // Validate user object
        if (!user || !user.email || !user.role) {
          throw new Error('Invalid user data structure');
        }

        console.log('Google OAuth callback data:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          userEmail: user.email,
          userRole: user.role
        });

        // Store authentication data directly (bypass login function redirect)
        if (typeof window !== 'undefined') {
          localStorage.setItem('docuflow_access_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('docuflow_refresh_token', refreshToken);
          }
          localStorage.setItem('docuflow_user', JSON.stringify(user));

          // Set cookies for immediate effect
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `auth=true; path=/; expires=${expires}; SameSite=Lax`;
          document.cookie = `user_role=${user.role}; path=/; expires=${expires}; SameSite=Lax`;
          document.cookie = `x-user-role=${user.role}; path=/; expires=${expires}; SameSite=Lax`;
        }

        // Show success message
        message.success("Google login successful!");
        setStatus('success');

        // Redirect based on user role with bypass parameters to prevent middleware loops
        const role = user.role.toLowerCase();
        const redirectUrl = `/${role}/dashboard?google_auth=success&fresh=true&ts=${Date.now()}`;

        // Wait a moment for user to see success, then redirect
        setTimeout(() => {
          // Use window.location.href instead of router.replace to ensure fresh page load
          window.location.href = redirectUrl;
        }, 1500);

      } catch (error) {
        console.error('Google OAuth callback error:', error);
        setStatus('error');
        
        const errorMsg = error instanceof Error ? error.message : 'Google login failed';
        setErrorMessage(errorMsg);
        message.error(errorMsg);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

  const handleRetryLogin = () => {
    router.replace('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Google Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Processing your Google login...
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {status === 'loading' && (
            <div className="text-center">
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
                className="mb-4"
              />
              <p className="text-lg text-gray-600">Authenticating with Google...</p>
              <p className="text-sm text-gray-500 mt-2">
                Please wait while we process your login.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircleOutlined 
                style={{ fontSize: 48, color: '#52c41a' }} 
                className="mb-4"
              />
              <p className="text-lg text-green-600 font-medium">Login Successful!</p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting to your dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <CloseCircleOutlined 
                style={{ fontSize: 48, color: '#ff4d4f' }} 
                className="mb-4"
              />
              <Alert
                message="Authentication Failed"
                description={errorMessage}
                type="error"
                showIcon
                className="mb-4 text-left"
              />
              <Button 
                type="primary" 
                onClick={handleRetryLogin}
                className="bg-orange-500 hover:!bg-orange-600"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Powered by DocuFlow secure authentication
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}