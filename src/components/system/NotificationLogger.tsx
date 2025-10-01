'use client';

import { useEffect } from 'react';

// This component logs all notification and error events for debugging
export default function NotificationLogger() {
  useEffect(() => {
    // Handle all notification events
    const handleNotification = (event: CustomEvent) => {
      const { type, message, duration } = event.detail || {};
      console.group('🔔 Notification Event');
      console.log('Type:', type);
      console.log('Message:', message);
      console.log('Duration:', duration);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    };

    // Handle login error events specifically
    const handleLoginError = (event: CustomEvent) => {
      const { message } = event.detail || {};
      console.group('🔒 Login Error Event');
      console.log('Message:', message);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    };

    // Handle React errors
    const handleReactError = (event: CustomEvent) => {
      const { error, info } = event.detail || {};
      console.group('⚛️ React Error Event');
      console.log('Error:', error);
      console.log('Info:', info);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    };

    // Handle unhandled rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.group('❌ Unhandled Promise Rejection');
      console.log('Reason:', event.reason);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    };

    // Add event listeners
    window.addEventListener('showNotification', handleNotification as EventListener);
    window.addEventListener('login-error', handleLoginError as EventListener);
    window.addEventListener('react-error', handleReactError as EventListener);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    console.log('🔍 Notification Logger initialized');

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