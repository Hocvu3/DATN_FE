'use client';

import React, { useEffect, useState } from 'react';
import { Alert } from 'antd';

// Simple LoginAlert component that doesn't depend on Toast
export default function LoginAlert() {
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Listen for login errors
    const handleLoginError = (event: CustomEvent) => {
      const message = event.detail?.message || 'Login failed';
      setError(message);
      setVisible(true);
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        setVisible(false);
      }, 8000);
    };

    // Add event listener for login errors
    window.addEventListener('login-error', handleLoginError as EventListener);
    
    return () => {
      window.removeEventListener('login-error', handleLoginError as EventListener);
    };
  }, []);

  if (!visible || !error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-72 shadow-lg">
      <Alert
        message="Login Error"
        description={error}
        type="error"
        showIcon
        closable
        onClose={() => setVisible(false)}
      />
    </div>
  );
}