'use client';

import { useEffect } from 'react';
import Toast from '@/components/common/Toast';
import { message } from 'antd';

export default function ToastInitializer() {
  // Function to show a direct message without Toast wrapper
  const showDirectMessage = (content: string, type: 'success' | 'error' | 'info') => {
    if (typeof window !== 'undefined') {
      console.log(`Showing direct ${type} message: ${content}`);
      
      // Temporarily suppress console.warn for antd compatibility warnings
      const originalWarn = console.warn;
      console.warn = (...args) => {
        const message = args[0]?.toString?.() || '';
        if (message.includes('antd: compatible') || message.includes('React is 16 ~ 18')) {
          return; // Suppress antd warnings
        }
        originalWarn.apply(console, args);
      };
      
      try {
        if (type === 'success') message.success(content);
        if (type === 'error') message.error(content);
        if (type === 'info') message.info(content);
      } finally {
        // Restore original console.warn after a short delay
        setTimeout(() => {
          console.warn = originalWarn;
        }, 100);
      }
    }
  };

  useEffect(() => {
    // Initialize Toast configurations when the app starts
    try {
      // Configure both Toast and direct message with suppressed warnings
      Toast.config();
      
      // Suppress Ant Design React version warnings
      const originalConsoleWarn = console.warn;
      console.warn = (...args) => {
        if (args[0]?.includes?.('antd: compatible') || 
            args[0]?.includes?.('React is 16 ~ 18')) {
          return; // Suppress antd compatibility warnings
        }
        originalConsoleWarn.apply(console, args);
      };
      
      message.config({
        top: 80,
        duration: 5,
        maxCount: 3,
      });
      
      console.log('Toast and message systems initialized');
      
      // Test direct message in development mode only
      if (process.env.NODE_ENV === 'development') {
        // Use setTimeout to avoid showing the warning during initialization
        setTimeout(() => {
          showDirectMessage('Notification system initialized', 'info');
        }, 500);
      }
      
      // Set up global error handling
      window.addEventListener('unhandledrejection', (event) => {
        showDirectMessage(`Unhandled error: ${event.reason?.message || 'Unknown error'}`, 'error');
      });
      
      // Listen for login errors specifically
      window.addEventListener('login-error', ((e: CustomEvent) => {
        const message = e.detail?.message || 'Login failed';
        showDirectMessage(message, 'error');
      }) as EventListener);
    } catch (e) {
      console.error('Error initializing toast:', e);
    }
  }, []);
  
  return null;
}