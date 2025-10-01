'use client';

import { useEffect } from 'react';
import Toast from '@/components/common/Toast';

// Global notification system
// This component should be included in the main layout
export default function NotificationHandler() {
  useEffect(() => {
    // Listen for notification events
    const handleNotification = (event: CustomEvent) => {
      const { type, message, duration } = event.detail || {};
      
      if (type && message && Toast[type]) {
        Toast[type](message, duration);
      }
    };

    // Create a custom event type
    type CustomNotificationEvent = CustomEvent<{
      type: 'success' | 'error' | 'info' | 'warning';
      message: string;
      duration?: number;
    }>;

    // Add event listener
    window.addEventListener('showNotification', handleNotification as EventListener);
    
    // Log initialization
    console.log('Global notification handler initialized');

    // Demo notification after 2 seconds if in development mode
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => {
        // Show a test notification
        const event = new CustomEvent('showNotification', {
          detail: {
            type: 'info',
            message: 'Notification system ready',
            duration: 3
          }
        });
        window.dispatchEvent(event);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('showNotification', handleNotification as EventListener);
      };
    }
    
    return () => {
      window.removeEventListener('showNotification', handleNotification as EventListener);
    };
  }, []);
  
  return null;
}

// Helper function to show notifications from anywhere
export const showNotification = (
  type: 'success' | 'error' | 'info' | 'warning',
  message: string,
  duration?: number
) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('showNotification', {
      detail: { type, message, duration }
    });
    window.dispatchEvent(event);
  }
};