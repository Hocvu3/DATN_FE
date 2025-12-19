"use client";

import { useEffect, ReactNode, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface RoleLayoutProps {
  children: ReactNode;
}

export default function RoleLayout({ children }: RoleLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();

  // Get user role from cookie or localStorage BEFORE first render - NOT from pathname
  const getUserRole = (): "admin" | "department" | "employee" => {
    // Try to get role from cookie first
    if (typeof document !== 'undefined') {
      const roleCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_role='))
        ?.split('=')[1];
        
      if (roleCookie) {
        return roleCookie as "admin" | "department" | "employee";
      }
      
      // Try localStorage as fallback
      try {
        const userData = localStorage.getItem("docuflow_user");
        if (userData) {
          const user = JSON.parse(userData);
          return (user?.role || "employee").toLowerCase() as "admin" | "department" | "employee";
        }
      } catch (error) {
        // Silently fail
      }
    }
    
    // Default fallback (though this should not happen in normal flow)
    return "employee";
  };

  // Initialize with actual role immediately to prevent menu flicker
  const [userRole, setUserRole] = useState<"admin" | "department" | "employee">(() => getUserRole());

  useEffect(() => {
    // Update role if it changes (e.g., after login)
    const currentRole = getUserRole();
    if (currentRole !== userRole) {
      setUserRole(currentRole);
    }
  }, [pathname]); // Re-check when pathname changes

  useEffect(() => {
    // Only check if we need to redirect when auth status is ready
    if (loading) return;

    const safeRedirect = (url: string, reason: string) => {
      router.replace(url);
    };

    if (!isAuthenticated) {
      safeRedirect("/login", "Not authenticated");
      return;
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!isAuthenticated || !pathname) return;

    const safeRedirect = (url: string, reason: string) => {
      router.replace(url);
    };

    // Get user role directly from cookie or localStorage
    const roleCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_role='))
      ?.split('=')[1];
      
    // Try localStorage if cookie doesn't exist
    let authUserRole = roleCookie || "";
    if (!authUserRole) {
      try {
        const userData = localStorage.getItem("docuflow_user");
        if (userData) {
          const user = JSON.parse(userData);
          authUserRole = (user?.role || "").toLowerCase();
          
          if (!roleCookie && authUserRole) {
            document.cookie = `user_role=${authUserRole}; path=/; max-age=604800; SameSite=Lax`;
          }
        } else {
          safeRedirect("/login", "No user data");
          return;
        }
      } catch (error) {
        safeRedirect("/login", "Error parsing user data");
        return;
      }
    }
    
    if (!authUserRole) {
      safeRedirect("/login", "No role found");
      return;
    }
    
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const roleFromPath = pathSegments[0];
    
    if (roleFromPath === "admin" && authUserRole !== "admin") {
      safeRedirect("/login?unauthorized=true", "Not authorized for admin path");
    } 
    else if (roleFromPath === "department" && authUserRole !== "department" && authUserRole !== "manager") {
      safeRedirect("/login?unauthorized=true", "Not authorized for department path");
    } 
    else if (roleFromPath === "employee" && authUserRole !== "employee") {
      safeRedirect("/login?unauthorized=true", "Not authorized for employee path");
    }
  }, [pathname, isAuthenticated, router]);

  return <DashboardLayout userRole={userRole}>{children}</DashboardLayout>;
}
