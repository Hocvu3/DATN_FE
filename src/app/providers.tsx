"use client";
import { AuthProvider } from "@/lib/authProvider";
import { App } from "antd";
import ToastInitializer from "@/components/common/ToastInitializer";
import NotificationHandler from "@/components/common/NotificationHandler";
import NotificationSystem from "@/components/system/NotificationSystem";
import ErrorBoundary from "@/components/system/ErrorBoundary";
import NotificationLogger from "@/components/system/NotificationLogger";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { useAuth } from "@/lib/authProvider";

function NotificationWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <NotificationProvider userId={user?.id} userRole={user?.role}>
      {children}
    </NotificationProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationWrapper>
          <App>
            {/* Multiple notification layers for redundancy */}
            <ToastInitializer />
            <NotificationHandler />
            <NotificationSystem />
            {/* Debug logger - only logs to console, no UI */}
            {process.env.NODE_ENV === 'development' && <NotificationLogger />}
            {children}
          </App>
        </NotificationWrapper>
      </AuthProvider>
    </ErrorBoundary>
  );
}
