'use client';

import React, { useEffect } from 'react';
import { Alert, Button } from 'antd';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service
    
    // Log to server or analytics
    if (typeof window !== 'undefined') {
      try {
        // Create a custom event for error tracking
        const event = new CustomEvent('react-error', {
          detail: { 
            error: { 
              message: error.message,
              stack: error.stack
            }, 
            info: errorInfo 
          }
        });
        window.dispatchEvent(event);
      } catch (e) {
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md">
            <Alert
              message="Something went wrong"
              description={
                <div className="space-y-4">
                  <p>We apologize for the inconvenience. The application encountered an unexpected error.</p>
                  <p className="text-sm text-gray-500">
                    Error details: {this.state.error?.message || 'Unknown error'}
                  </p>
                  <div className="flex justify-center mt-4">
                    <Button 
                      type="primary"
                      onClick={() => {
                        this.setState({ hasError: false, error: null });
                        window.location.reload();
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              }
              type="error"
              showIcon
              className="shadow-lg"
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to add useEffect functionality
export default function ErrorBoundaryWrapper({ children }: ErrorBoundaryProps) {
  useEffect(() => {
    // Listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      
      // Show a toast or notification
      if (typeof window !== 'undefined') {
        try {
          const notificationEvent = new CustomEvent('showNotification', {
            detail: {
              type: 'error',
              message: `Unhandled error: ${event.reason?.message || 'Unknown error'}`,
              duration: 8
            }
          });
          window.dispatchEvent(notificationEvent);
        } catch (e) {
        }
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <ErrorBoundary>{children}</ErrorBoundary>;
}