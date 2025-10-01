'use client';

import React, { useEffect, useState } from 'react';
import { Alert } from 'antd';

// Component to display login success notification
export default function LoginSuccess() {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [redirectInfo, setRedirectInfo] = useState<string | null>(null);

  useEffect(() => {
    // Listen for successful login events
    const handleLoginSuccess = (event: CustomEvent) => {
      const successMsg = event.detail?.message || 'Login successful';
      const userData = event.detail?.userData;
      
      console.log('LoginSuccess received:', successMsg, userData);
      setMessage(successMsg);
      setVisible(true);
      
      // Add information about the user role
      if (userData && userData.role) {
        const role = userData.role.toLowerCase();
        let roleName = "Employee"; // Default
        
        if (role === "admin") roleName = "Administrator";
        else if (role === "department") roleName = "Department Manager";
        
        setRedirectInfo(`Welcome ${roleName}! Redirecting to dashboard...`);
      }
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    };

    // Add event listener for login-success
    window.addEventListener('login-success', handleLoginSuccess as EventListener);
    
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess as EventListener);
    };
  }, []);

  if (!visible || !message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 shadow-lg">
      <Alert
        message="Login Successful"
        description={
          <div className="space-y-1">
            <p>{message}</p>
            {redirectInfo && <p className="text-sm italic">{redirectInfo}</p>}
          </div>
        }
        type="success"
        showIcon
        closable
        onClose={() => setVisible(false)}
      />
    </div>
  );
}