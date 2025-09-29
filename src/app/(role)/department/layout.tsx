"use client";

import { ReactNode } from "react";

interface DepartmentLayoutProps {
  children: ReactNode;
}

export default function DepartmentLayout({ children }: DepartmentLayoutProps) {
  return <>{children}</>;
}
