"use client";

import PublicLayout from "./(public)/layout";
import { ReactNode } from "react";

// This layout ensures the root page inherits the public layout
export default function RootLayout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
