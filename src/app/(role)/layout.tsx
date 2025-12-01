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

  // Get user role from cookie or localStorage - NOT from pathname
  const [userRole, setUserRole] = useState<"admin" | "department" | "employee">("employee");

  useEffect(() => {
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
          console.error("Error parsing user data:", error);
        }
      }
      
      // Default fallback (though this should not happen in normal flow)
      return "employee";
    };

    setUserRole(getUserRole());
  }, []);

  useEffect(() => {
    // Only check if we need to redirect when auth status is ready
    if (loading) return; // Don't check until auth loading is complete

    // Helper function to handle redirects to avoid multiple redirects
    const safeRedirect = (url: string, reason: string) => {
      console.log(`Redirecting to ${url}: ${reason}`);
      router.replace(url);
    };

    // Only check auth once when component mounts
    if (!isAuthenticated) {
      console.log("User not authenticated in role layout");
      safeRedirect("/login", "Not authenticated");
      return;
    }
  }, [isAuthenticated, loading, router]);

  // Separate useEffect for pathname-based checks
  useEffect(() => {
    if (!isAuthenticated || !pathname) return;

    const safeRedirect = (url: string, reason: string) => {
      console.log(`Redirecting to ${url}: ${reason}`);
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
          console.log("User role from localStorage:", authUserRole);
          
          // Update the role cookie if missing
          if (!roleCookie && authUserRole) {
            document.cookie = `user_role=${authUserRole}; path=/; max-age=604800; SameSite=Lax`;
          }
        } else {
          console.warn("No user data found in localStorage");
          safeRedirect("/login", "No user data");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        safeRedirect("/login", "Error parsing user data");
        return;
      }
    }
    
    if (!authUserRole) {
      console.warn("No role found for authenticated user");
      safeRedirect("/login", "No role found");
      return;
    }

    console.log(`Checking authorization - Path: ${pathname}, Role: ${authUserRole}`);
    
    // Strict role-based access control with proper hierarchy
    // Check the first segment after the slash to determine the role area
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const roleFromPath = pathSegments[0]; // First segment is the role area
    
    console.log(`Path segments: [${pathSegments.join(', ')}], Role from path: ${roleFromPath}`);
    
    // Admin paths require admin role only
    if (roleFromPath === "admin" && authUserRole !== "admin") {
      console.log("User not authorized for admin path");
      safeRedirect("/login?unauthorized=true", "Not authorized for admin path");
    } 
    // Department paths require department or manager role
    else if (roleFromPath === "department" && authUserRole !== "department" && authUserRole !== "manager") {
      console.log("User not authorized for department path");
      safeRedirect("/login?unauthorized=true", "Not authorized for department path");
    } 
    // Employee paths require employee role only
    else if (roleFromPath === "employee" && authUserRole !== "employee") {
      console.log("User not authorized for employee path");
      safeRedirect("/login?unauthorized=true", "Not authorized for employee path");
    }
  }, [pathname, isAuthenticated, router]);

  return <DashboardLayout userRole={userRole}>{children}</DashboardLayout>;
}
