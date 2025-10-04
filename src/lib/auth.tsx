"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  login: (email: string, password: string) => Promise<void>;
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
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Remove a cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if token exists in localStorage on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getAuthToken(); // Use the exported helper function

        if (token) {
          // For demo purposes, we'll create a fake user based on token
          // In a real app, you'd decode the JWT or make an API call
          const fakeUser = {
            id: "1",
            name: "Admin User",
            email: "admin@docuflow.com",
            role: "admin",
          };

          setUser(fakeUser);
          setCookie("auth", "true", 7); // Set auth cookie for middleware
        } else {
          setUser(null);
          removeCookie("auth");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
        removeCookie("auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // This is a mock login - in a real app you'd call your API
      if (email === "admin@docuflow.com" && password === "password") {
        // Mock successful login
        const accessToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJuYW1lIjoiQWRtaW4gVXNlciIsImVtYWlsIjoiYWRtaW5AZG9jdWZsb3cuY29tIiwicm9sZSI6ImFkbWluIn0.8tat9ExjJgNu8KB-MBCwgDkOi0iQpcjKbdHsB9Z7mQ8";
        const refreshToken = "refresh-token-would-go-here";

        // Use the exported helper function for consistency
        saveAuthTokens(accessToken, refreshToken);

        const fakeUser = {
          id: "1",
          name: "Admin User",
          email: "admin@docuflow.com",
          role: "admin",
        };

        // Save user data to localStorage
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(fakeUser));

        setUser(fakeUser);
        setCookie("auth", "true", 7); // Set auth cookie for middleware
        message.success("Login successful");

        // Add short timeout to ensure state is updated before redirect
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 100);
      } else {
        message.error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Remove auth tokens using consistent keys
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);

    setUser(null);
    removeCookie("auth");
    message.info("Logged out successfully");
    router.push("/");
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
