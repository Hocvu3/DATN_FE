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
    <Layout className="public-layout" style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <PublicHeader />
      <Layout.Content style={{ background: "#f5f5f5" }}>
        {children}
      </Layout.Content>
      <PublicFooter />
    </Layout>
  );
}
