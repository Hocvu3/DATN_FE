"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authProvider";
import { Button, Card, Typography, Tag, Divider } from "antd";

const { Title, Text } = Typography;

/**
 * A debugging component to help diagnose authentication issues
 * Only use during development!
 */
export default function AuthDebugger() {
  const { user, isAuthenticated } = useAuth();
  const [authState, setAuthState] = useState<any>({});
  
  const refreshDebugInfo = () => {
    // Get localStorage auth items
    const accessToken = localStorage.getItem("docuflow_access_token");
    const refreshToken = localStorage.getItem("docuflow_refresh_token");
    const userData = localStorage.getItem("docuflow_user");
    
    // Parse cookies
    const cookies = document.cookie.split(";").reduce((acc, curr) => {
      const [key, value] = curr.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    // Get sessionStorage auth flags
    const sessionFlags: Record<string, string> = {};
    for (const key in sessionStorage) {
      if (
        key.startsWith("path_visited_") || 
        key.startsWith("role_check_") ||
        key === "user_authenticated" ||
        key === "auth_status_checked" ||
        key === "dashboard_auth_checked"
      ) {
        sessionFlags[key] = sessionStorage.getItem(key) || "";
      }
    }
    
    setAuthState({
      localStorage: {
        accessToken: accessToken ? "exists" : null,
        accessTokenLength: accessToken?.length || 0,
        refreshToken: refreshToken ? "exists" : null,
        userData: userData ? JSON.parse(userData) : null,
      },
      cookies,
      sessionFlags,
      contextUser: user,
      isAuthenticated,
    });
  };
  
  useEffect(() => {
    refreshDebugInfo();
    
    // Refresh debug info periodically
    const interval = setInterval(refreshDebugInfo, 2000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);
  
  const clearAuth = () => {
    // Clear localStorage
    localStorage.removeItem("docuflow_access_token");
    localStorage.removeItem("docuflow_refresh_token");
    localStorage.removeItem("docuflow_user");
    localStorage.removeItem("auth_status_checked");
    
    // Clear cookies
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Clear sessionStorage flags
    for (const key in sessionStorage) {
      if (
        key.startsWith("path_visited_") || 
        key.startsWith("role_check_") ||
        key === "user_authenticated" ||
        key === "auth_status_checked" ||
        key === "dashboard_auth_checked"
      ) {
        sessionStorage.removeItem(key);
      }
    }
    
    refreshDebugInfo();
    alert("Auth state cleared. You will need to log in again.");
    window.location.href = "/login?force=true";
  };
  
  return (
    <Card className="my-4 border border-orange-200">
      <div className="flex justify-between items-center">
        <Title level={4} className="m-0">Authentication Debugger</Title>
        <div>
          <Button size="small" type="primary" onClick={refreshDebugInfo} className="mr-2">
            Refresh
          </Button>
          <Button size="small" danger onClick={clearAuth}>
            Clear Auth
          </Button>
        </div>
      </div>
      
      <Divider className="my-3" />
      
      <div className="mb-3">
        <Text strong>Auth Context State: </Text>
        <Tag color={isAuthenticated ? "success" : "error"}>
          {isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </Tag>
      </div>
      
      <div className="mb-3">
        <Text strong>LocalStorage:</Text>
        <div className="pl-4">
          <div>
            <Text type="secondary">Access Token: </Text>
            {authState.localStorage?.accessToken ? (
              <Tag color="success">Present ({authState.localStorage.accessTokenLength} chars)</Tag>
            ) : (
              <Tag color="error">Missing</Tag>
            )}
          </div>
          <div>
            <Text type="secondary">Refresh Token: </Text>
            {authState.localStorage?.refreshToken ? (
              <Tag color="success">Present</Tag>
            ) : (
              <Tag color="error">Missing</Tag>
            )}
          </div>
          <div>
            <Text type="secondary">User Data: </Text>
            {authState.localStorage?.userData ? (
              <Tag color="success">Present</Tag>
            ) : (
              <Tag color="error">Missing</Tag>
            )}
          </div>
          {authState.localStorage?.userData && (
            <pre className="bg-gray-50 p-2 text-xs mt-1 rounded">
              {JSON.stringify(authState.localStorage.userData, null, 2)}
            </pre>
          )}
        </div>
      </div>
      
      <div className="mb-3">
        <Text strong>Cookies:</Text>
        <div className="pl-4">
          <div>
            <Text type="secondary">auth: </Text>
            {authState.cookies?.auth === "true" ? (
              <Tag color="success">true</Tag>
            ) : (
              <Tag color="error">Missing/Invalid</Tag>
            )}
          </div>
          <div>
            <Text type="secondary">user_role: </Text>
            {authState.cookies?.user_role ? (
              <Tag color="success">{authState.cookies.user_role}</Tag>
            ) : (
              <Tag color="error">Missing</Tag>
            )}
          </div>
        </div>
      </div>
      
      <div>
        <Text strong>Session Flags:</Text>
        {Object.keys(authState.sessionFlags || {}).length > 0 ? (
          <div className="pl-4">
            {Object.entries(authState.sessionFlags || {}).map(([key, value]) => (
              <div key={key}>
                <Text type="secondary">{key}: </Text>
                <Tag>{value as string}</Tag>
              </div>
            ))}
          </div>
        ) : (
          <div className="pl-4">
            <Text type="secondary">No session flags found</Text>
          </div>
        )}
      </div>
    </Card>
  );
}