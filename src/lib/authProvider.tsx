"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";

// Constants for localStorage keys
const ACCESS_TOKEN_KEY = "docuflow_access_token";
const REFRESH_TOKEN_KEY = "docuflow_refresh_token";
const USER_DATA_KEY = "docuflow_user";

// Export auth helper functions to maintain compatibility
export function saveAuthTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getCurrentUser(): any | null {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem(USER_DATA_KEY);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
  }
  return null;
}

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (
    email: string, 
    password: string,
    accessToken?: string,
    refreshToken?: string,
    userData?: any
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Export with const for compatibility
export const useAuth = () => {
  return useContext(AuthContext);
};

// Set a cookie with auth state for middleware
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// Remove a cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication when component mounts
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getAuthToken();
        const authCookie = document.cookie.includes('auth=true');
        
        // Only consider authenticated if both token and user data exist
        if (token) {
          // Read user information from localStorage instead of using fake data
          const userData = localStorage.getItem(USER_DATA_KEY);
          
          if (userData) {
            try {
              const savedUser = JSON.parse(userData);
              
              if (!document.cookie.includes('auth=true')) {
                setCookie("auth", "true", 7);
              }
              
              // Always sync role cookie with localStorage to ensure consistency
              if (savedUser.role) {
                const currentRoleCookie = document.cookie
                  .split('; ')
                  .find(row => row.startsWith('user_role='))
                  ?.split('=')[1];
                
                const expectedRole = savedUser.role.toLowerCase();
                
                if (currentRoleCookie !== expectedRole) {
                  setCookie("user_role", expectedRole, 7);
                }
              }
              
              // Update the user state
              setUser(savedUser);
              
              // Set a session flag to prevent repeated auth checks
              sessionStorage.setItem('user_authenticated', 'true');
              
            } catch (e) {
              handleLogout();
            }
          } else {
            handleLogout();
          }
        } else if (authCookie) {
          const userData = localStorage.getItem(USER_DATA_KEY);
          if (userData) {
            try {
              const savedUser = JSON.parse(userData);
              setUser(savedUser);
            } catch {
              handleLogout();
            }
          } else {
            handleLogout();
          }
        } else {
          // No token and no auth cookie - not logged in
          handleLogout();
        }
      } catch (error) {
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    
    const handleLogout = () => {
      setUser(null);
      removeCookie("auth");
      removeCookie("user_role");
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      sessionStorage.removeItem('user_authenticated');
    };

    // Check authentication once when component mounts
    checkAuth();
    
    // Add an event listener to detect storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACCESS_TOKEN_KEY || e.key === USER_DATA_KEY) {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Note: Removed cookie interval check to prevent refresh loops
    // Auth state is managed by localStorage and initial page load check
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Enhanced login function that supports both mock login and API login
  const login = async (
    email: string, 
    password: string, 
    accessToken?: string, 
    refreshToken?: string,
    userData?: any
  ) => {
    try {
      setLoading(true);

      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      removeCookie("auth");
      removeCookie("user_role");
      sessionStorage.removeItem('user_authenticated');
      
      sessionStorage.removeItem('dashboard_auth_checked');
      sessionStorage.removeItem('auth_status_checked');
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('path_visited_') || key?.startsWith('role_check_')) {
          sessionStorage.removeItem(key);
        }
      }
      
      // Handle mock login if no tokens are provided
      if (!accessToken && email === "admin@docuflow.com" && password === "password") {
        // Use mock data
        accessToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJuYW1lIjoiQWRtaW4gVXNlciIsImVtYWlsIjoiYWRtaW5AZG9jdWZsb3cuY29tIiwicm9sZSI6ImFkbWluIn0.8tat9ExjJgNu8KB-MBCwgDkOi0iQpcjKbdHsB9Z7mQ8";
        refreshToken = "refresh-token-would-go-here";
        
        userData = {
          id: "1",
          name: "Admin User",
          email: "admin@docuflow.com",
          role: "admin",
        };
      } else if (!accessToken) {
        // If we're not using mock data and no token is provided, it's an error
        throw new Error("Invalid credentials");
      }

      saveAuthTokens(accessToken, refreshToken || "");

      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      document.cookie = `auth=true; path=/; max-age=604800; SameSite=Lax`;
      
      if (userData?.role) {
        const roleLower = userData.role.toLowerCase();
        document.cookie = `user_role=${roleLower}; path=/; max-age=604800; SameSite=Lax`;
        
        document.cookie = `x-user-role=${roleLower}; path=/; max-age=604800; SameSite=Lax`;
      }
      
      sessionStorage.setItem('user_authenticated', 'true');
      
      setUser(userData);
      
      message.success("Login successful");

      let redirectUrl = "/employee/dashboard";
      
      if (userData?.role) {
        const role = userData.role.toLowerCase();
        if (role === "admin") {
          redirectUrl = "/admin/dashboard";
        } else if (role === "department") {
          redirectUrl = "/department/dashboard";
        } else if (role === "employee") {
          redirectUrl = "/employee/dashboard";
        }
      }

      const ts = Date.now();
      const rand = Math.random().toString(36).substring(2, 15);
      const finalRedirectUrl = `${redirectUrl}?ts=${ts}&key=${rand}&fresh=true`;
      
      setTimeout(() => {
        try {
          const event = new CustomEvent('auth-redirect', {
            detail: { url: finalRedirectUrl, role: userData?.role }
          });
          window.dispatchEvent(event);
        } catch (e) {
          // Silently fail
        }
        
        window.location.replace(finalRedirectUrl);
      }, 800);
      
    } catch (error) {
      message.error("Login failed");
      // Clear any partial auth state on error
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      removeCookie("auth");
      removeCookie("user_role");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && (
          key.startsWith('dashboard_auth_') || 
          key === 'user_authenticated' || 
          key === 'auth_status_checked' ||
          key.startsWith('path_visited_') || 
          key.startsWith('role_check_')
        )) {
        sessionStorage.removeItem(key);
      }
    }

    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    
    setUser(null);
    
    message.info("Logged out successfully");
    
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
