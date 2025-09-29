"use client";

import { ReactNode } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import PublicFooter from "@/components/layout/PublicFooter";
import { Layout } from "antd";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <Layout className="min-h-screen">
      <PublicHeader />
      <Layout.Content>{children}</Layout.Content>
      <PublicFooter />
    </Layout>
  );
}
