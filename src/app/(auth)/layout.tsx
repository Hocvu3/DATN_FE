"use client";

import { ReactNode } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout min-h-screen flex flex-col">
      <PublicHeader />
      <div className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
