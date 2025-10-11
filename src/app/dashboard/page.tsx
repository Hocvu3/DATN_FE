"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // This page should never be reached due to middleware redirect
    // But just in case, try to get user role from localStorage and redirect
    try {
      const userData = localStorage.getItem('docuflow_user');
      if (userData) {
        const user = JSON.parse(userData);
        const role = user.role?.toLowerCase() || 'employee';
        router.replace(`/${role}/dashboard`);
      } else {
        // No user data, redirect to login
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error redirecting from dashboard:', error);
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
          className="mb-4"
        />
        <p className="text-lg text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}