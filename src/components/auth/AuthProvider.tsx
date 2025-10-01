"use client";

import { useEffect } from "react";
import { isAuthenticated } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Set authentication cookie based on localStorage
    if (isAuthenticated()) {
      document.cookie = "isAuthenticated=true; path=/;";
    } else {
      // Clear the cookie if not authenticated
      document.cookie =
        "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    // Check if current path is protected and redirect if needed
    const isProtectedRoute =
      pathname?.startsWith("/admin") ||
      pathname?.startsWith("/employee") ||
      pathname?.startsWith("/department");

    if (isProtectedRoute && !isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Check if current path is auth route and redirect if needed
    const isAuthRoute =
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/register") ||
      pathname?.startsWith("/forgot-password");

    if (isAuthRoute && isAuthenticated()) {
      // Check user role and redirect to appropriate dashboard
      const userData = localStorage.getItem("docuflow_user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === "admin") {
          router.push("/admin/dashboard");
        } else if (user.role === "employee") {
          router.push("/employee/dashboard");
        } else {
          router.push("/department/dashboard");
        }
      } else {
        router.push("/home");
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}
