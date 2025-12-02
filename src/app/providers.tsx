"use client";
import { AuthProvider } from "@/lib/authProvider";
import { App } from "antd";
import ToastInitializer from "@/components/common/ToastInitializer";
import NotificationHandler from "@/components/common/NotificationHandler";
import NotificationSystem from "@/components/system/NotificationSystem";
import ErrorBoundary from "@/components/system/ErrorBoundary";
import NotificationLogger from "@/components/system/NotificationLogger";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <App>
          {/* Multiple notification layers for redundancy */}
          <ToastInitializer />
          <NotificationHandler />
          <NotificationSystem />
          {/* Debug logger - only logs to console, no UI */}
          {process.env.NODE_ENV === 'development' && <NotificationLogger />}
          {children}
        </App>
      </AuthProvider>
    </ErrorBoundary>
  );
}
