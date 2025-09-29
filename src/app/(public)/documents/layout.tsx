"use client";

import { ReactNode } from "react";

interface DocumentsLayoutProps {
  children: ReactNode;
}

export default function DocumentsLayout({ children }: DocumentsLayoutProps) {
  return <div className="container mx-auto px-4 py-6">{children}</div>;
}
