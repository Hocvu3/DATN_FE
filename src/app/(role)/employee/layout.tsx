"use client";

import { ReactNode } from "react";

interface EmployeeLayoutProps {
  children: ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  return <>{children}</>;
}
