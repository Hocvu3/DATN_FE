'use client';

import { useEffect } from 'react';
import { notification } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';
import Toast from '../common/Toast';

// Comprehensive notification system that combines multiple approaches
export default function NotificationSystem() {
  const [api, contextHolder] = notification.useNotification();
  
  // Store the API in a global reference that can be used outside React
  useEffect(() => {
    if (typeof window !== 'undefined' && api) {
      // Create a global notification handler that can be called from anywhere
      (window as any).showGlobalNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string, description: string = '') => {
        switch (type) {
          case 'success':
            api.success({ message, description, placement: 'topRight' });
            break;
          case 'error':
            api.error({ message, description, placement: 'topRight' });
            break;
          case 'info':
            api.info({ message, description, placement: 'topRight' });
            break;
          case 'warning':
            api.warning({ message, description, placement: 'topRight' });
            break;
          default:
            console.warn(`Unknown notification type: ${type}`);
        }
      };

      // Create fallback system in case Toast fails
      (window as any).notificationApi = api;
    }

    // Listen for custom events to show notifications
    const handleShowNotification = (event: CustomEvent) => {
      const { type, message, duration } = event.detail;
      
      try {
        // Try Toast first
        if (type === 'success') Toast.success(message, duration);
        else if (type === 'error') Toast.error(message, duration);
        else if (type === 'info') Toast.info(message, duration);
        else if (type === 'warning') Toast.warning(message, duration);
        
        console.log("Displayed via Toast:", message);
      } catch (e) {
        console.error("Toast failed, falling back to direct notification:", e);
        
        // Fallback to direct notification
        try {
          switch (type) {
            case 'success':
              api.success({
                message: type.charAt(0).toUpperCase() + type.slice(1),
                description: message,
                duration: duration || 4.5,
              });
              break;
            case 'error':
              api.error({
                message: type.charAt(0).toUpperCase() + type.slice(1),
                description: message,
                duration: duration || 4.5,
              });
              break;
            case 'info':
              api.info({
                message: type.charAt(0).toUpperCase() + type.slice(1),
                description: message,
                duration: duration || 4.5,
              });
              break;
            case 'warning':
              api.warning({
                message: type.charAt(0).toUpperCase() + type.slice(1),
                description: message,
                duration: duration || 4.5,
              });
              break;
            default:
              console.warn(`Unknown notification type: ${type}`);
          }
        } catch (err) {
          console.error("Both notification systems failed:", err);
        }
      }
    };

    window.addEventListener('showNotification', handleShowNotification as EventListener);
    
    return () => {
      delete (window as any).showGlobalNotification;
      delete (window as any).notificationApi;
      window.removeEventListener('showNotification', handleShowNotification as EventListener);
    };
  }, [api]);

  return contextHolder;
}

// Export a utility for direct access
export const GlobalNotification = {
  show: (type: 'success' | 'error' | 'info' | 'warning', message: string, description: string = '') => {
    if (typeof window !== 'undefined') {
      // Try our global handler first
      const handler = (window as any).showGlobalNotification;
      if (handler) {
        handler(type, message, description);
        return;
      }
      
      // Fall back to direct api access
      const api = (window as any).notificationApi as NotificationInstance;
      if (api) {
        api[type]({
          message,
          description,
          placement: 'topRight',
        });
        return;
      }

      // Last resort: custom event
      try {
        const event = new CustomEvent('showNotification', {
          detail: { type, message, description }
        });
        window.dispatchEvent(event);
      } catch (e) {
        console.error("All notification systems failed:", e);
        alert(`${type.toUpperCase()}: ${message}\n${description}`);
      }
    }
  },
  
  success: (message: string, description: string = '') => 
    GlobalNotification.show('success', message, description),
    
  error: (message: string, description: string = '') => 
    GlobalNotification.show('error', message, description),
    
  info: (message: string, description: string = '') => 
    GlobalNotification.show('info', message, description),
    
  warning: (message: string, description: string = '') => 
    GlobalNotification.show('warning', message, description),
};