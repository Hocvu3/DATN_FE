"use client";

import { useEffect, useState } from 'react';
import { Button, Space, message } from 'antd';
import { useRouter } from 'next/navigation';

export default function DebugLogin() {
  const [logoutTriggered, setLogoutTriggered] = useState(false);
  const router = useRouter();

  // This effect handles emergency auth state clearing
  useEffect(() => {
    if (logoutTriggered) {
      try {
        // Remove localStorage items
        localStorage.removeItem('docuflow_access_token');
        localStorage.removeItem('docuflow_refresh_token');
        localStorage.removeItem('docuflow_user');
        
        // Clear cookies
        document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "x-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        
        // Clear sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) sessionStorage.removeItem(key);
        }
        
        message.success('Authentication state cleared');
        
        // Redirect to login with force=true
        setTimeout(() => {
          window.location.href = '/login?force=true&reset=true';
        }, 1000);
      } catch (e) {
        message.error('Failed to clear auth state');
      }
    }
  }, [logoutTriggered]);

  // This will allow us to see if the login page is working correctly
  return (
    <div className="p-4 border border-gray-200 rounded bg-white mb-4">
      <h3 className="text-md font-medium mb-2">Debug Controls</h3>
      <Space>
        <Button 
          danger
          onClick={() => setLogoutTriggered(true)}
          disabled={logoutTriggered}
        >
          Emergency Clear Auth
        </Button>
        <Button
          type="primary"
          onClick={() => router.push('/login?force=true')}
        >
          Force Login Page
        </Button>
        <Button
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set('debug', 'true');
            window.location.href = url.toString();
          }}
        >
          Enable Debug Mode
        </Button>
      </Space>
    </div>
  );
}