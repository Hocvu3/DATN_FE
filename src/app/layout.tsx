import type { Metadata } from "next";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "./providers";
// Import toast initializer
import "@/lib/init-toast";

export const metadata: Metadata = {
  title: "DocuFlow",
  description:
    "Document Management System - Secure document workflow management platform",
  icons: {
    icon: "/favicon-new.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
