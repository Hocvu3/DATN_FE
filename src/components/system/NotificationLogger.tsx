'use client';

import { useEffect } from 'react';

// This component logs all notification and error events for debugging
export default function NotificationLogger() {
  useEffect(() => {
    // Handle all notification events
    const handleNotification = (event: CustomEvent) => {
      const { type, message, duration } = event.detail || {};
    };

    const handleLoginError = (event: CustomEvent) => {
      const { message } = event.detail || {};
    };

    const handleReactError = (event: CustomEvent) => {
      const { error, info } = event.detail || {};
    };

    // Handle unhandled rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    };

    // Add event listeners
    window.addEventListener('showNotification', handleNotification as EventListener);
    window.addEventListener('login-error', handleLoginError as EventListener);
    window.addEventListener('react-error', handleReactError as EventListener);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    

    return () => {
      // Clean up
      window.removeEventListener('showNotification', handleNotification as EventListener);
      window.removeEventListener('login-error', handleLoginError as EventListener);
      window.removeEventListener('react-error', handleReactError as EventListener);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  return null;
}