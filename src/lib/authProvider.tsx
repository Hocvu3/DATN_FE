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
      console.error("Error parsing user data:", e);
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
  // Set cookie with SameSite=Lax to allow cross-site access but protect against CSRF
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  
  // Log cookie setting for debugging
  console.log(`Cookie set: ${name}=${value} (expires in ${days} days)`);
};

// Remove a cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  console.log(`Cookie removed: ${name}`);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication when component mounts
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getAuthToken(); // Use helper function
        const authCookie = document.cookie.includes('auth=true');
        
        // Debugging
        console.log("Auth check - token exists:", !!token);
        console.log("Auth check - auth cookie exists:", authCookie);
        
        // Only consider authenticated if both token and user data exist
        if (token) {
          // Read user information from localStorage instead of using fake data
          const userData = localStorage.getItem(USER_DATA_KEY);
          
          if (userData) {
            try {
              const savedUser = JSON.parse(userData);
              
              // Set important flags to prevent logout loops
              if (!document.cookie.includes('auth=true')) {
                setCookie("auth", "true", 7); // Set cookie for middleware
                console.log("Auth cookie set to true");
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
                  console.log(`User role cookie updated from ${currentRoleCookie} to ${expectedRole}`);
                }
              }
              
              // Update the user state
              setUser(savedUser);
              
              // Set a session flag to prevent repeated auth checks
              sessionStorage.setItem('user_authenticated', 'true');
              
            } catch (e) {
              console.error("Error parsing saved user data:", e);
              handleLogout();
            }
          } else {
            // Token exists but no user data - need to log in again
            console.warn("Token exists but no user data found");
            handleLogout();
          }
        } else if (authCookie) {
          // We have an auth cookie but no token - try to recover session
          console.warn("Auth cookie exists but no token - attempting to recover session");
          
          // If there's user data in localStorage, we can try to restore the session
          const userData = localStorage.getItem(USER_DATA_KEY);
          if (userData) {
            try {
              const savedUser = JSON.parse(userData);
              setUser(savedUser);
              // Don't remove cookies, they're still valid
              console.log("Session recovered from localStorage");
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
        console.error("Auth check error:", error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to handle logout logic
    const handleLogout = () => {
      setUser(null);
      removeCookie("auth");
      removeCookie("user_role");
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      sessionStorage.removeItem('user_authenticated');
      console.log("User logged out in auth check");
    };

    // Check authentication once when component mounts
    checkAuth();
    
    // Add an event listener to detect storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACCESS_TOKEN_KEY || e.key === USER_DATA_KEY) {
        console.log("Storage changed for:", e.key, "- rechecking auth");
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
      console.log('AuthProvider login attempt:', email);

      // Clear any previous auth data first to avoid conflicts
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      removeCookie("auth");
      removeCookie("user_role");
      sessionStorage.removeItem('user_authenticated');
      
      // Clear auth check flags
      sessionStorage.removeItem('dashboard_auth_checked');
      sessionStorage.removeItem('auth_status_checked');
      
      // Clear any path verification flags
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('path_visited_') || key?.startsWith('role_check_')) {
          sessionStorage.removeItem(key);
        }
      }
      
      console.log('Previous auth state cleared');
      
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

      // Save tokens and user data
      saveAuthTokens(accessToken, refreshToken || "");
      console.log('Auth tokens saved to localStorage');

      // Save user data to localStorage
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log('User data saved to localStorage');

      // Set cookies with SameSite=Lax and secure attributes for better security and cross-domain compatibility
      // Set auth cookie directly with document.cookie for immediate effect
      document.cookie = `auth=true; path=/; max-age=604800; SameSite=Lax`;
      
      // Set role cookie for middleware - also directly to ensure immediate effect
      if (userData?.role) {
        const roleLower = userData.role.toLowerCase();
        document.cookie = `user_role=${roleLower}; path=/; max-age=604800; SameSite=Lax`;
        console.log(`Role cookie set to: ${roleLower}`);
        
        // Also set a header cookie for API requests
        document.cookie = `x-user-role=${roleLower}; path=/; max-age=604800; SameSite=Lax`;
      }
      
      console.log('Auth and role cookies set directly');
      
      // Set session flag to indicate authentication
      sessionStorage.setItem('user_authenticated', 'true');
      
      // Update the user state
      setUser(userData);
      console.log('User state updated in context');
      
      // Show success message
      message.success("Login successful");

      // Determine redirect URL based on user role
      let redirectUrl = "/employee/dashboard"; // Default
      
      if (userData?.role) {
        const role = userData.role.toLowerCase();
        console.log(`Detected user role for redirect: ${role}`);
        if (role === "admin") {
          redirectUrl = "/admin/dashboard";
        } else if (role === "department") {
          redirectUrl = "/department/dashboard";
        } else if (role === "employee") {
          redirectUrl = "/employee/dashboard";
        }
      }

      // Wait for everything to be set before redirecting
      console.log('Preparing to redirect to:', redirectUrl);
      
      // Add debug and random query params to force fresh page load and bypass middleware cache
      const ts = Date.now();
      const rand = Math.random().toString(36).substring(2, 15);
      const finalRedirectUrl = `${redirectUrl}?ts=${ts}&key=${rand}&fresh=true`;
      
      console.log('Final redirect URL with cache-busting:', finalRedirectUrl);
      
      // Force a slight delay to ensure cookies are set before navigation
      setTimeout(() => {
        // First notify any listeners that we're about to redirect
        try {
          const event = new CustomEvent('auth-redirect', {
            detail: { url: finalRedirectUrl, role: userData?.role }
          });
          window.dispatchEvent(event);
        } catch (e) {
          console.error('Error dispatching auth-redirect event:', e);
        }
        
        // Use window.location for a hard redirect to ensure full page reload with new auth state
        console.log('Hard redirecting to dashboard:', finalRedirectUrl);
        window.location.replace(finalRedirectUrl); // Use replace to prevent going back to login page
      }, 800); // Increased delay to ensure cookies are set
      
    } catch (error) {
      console.error("Login error:", error);
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
    console.log("Logging out user...");
    
    // Remove auth tokens using consistent keys
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    
    // Clear all dashboard_auth flags from session storage
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && (
          key.startsWith('dashboard_auth_') || 
          key === 'user_authenticated' || 
          key === 'auth_status_checked' ||
          key.startsWith('path_visited_') || 
          key.startsWith('role_check_')
        )) {
        console.log(`Removing session storage key: ${key}`);
        sessionStorage.removeItem(key);
      }
    }

    // Remove cookies - use direct cookie manipulation for immediate effect
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    console.log("Auth cookies removed");
    
    // Clear user state
    setUser(null);
    
    // Show logout message
    message.info("Logged out successfully");
    
    // Use hard redirect for logout to ensure complete state reset
    console.log("Redirecting to home page after logout");
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
