"use client";

import { Button, Result } from "antd";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="py-4 px-6 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/docuflow-logo-new.svg"
              alt="DocuFlow Logo"
              width={140}
              height={35}
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button type="primary" size="large" className="min-w-[120px]">
                  Back Home
                </Button>
              </Link>
              <Link href="/login?force=true">
                <Button size="large" className="min-w-[120px]">
                  Login
                </Button>
              </Link>
            </div>
          }
        />
      </main>

      <footer className="py-4 px-6 border-t border-gray-200 bg-white">
        <div className="text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} DocuFlow | Secure Document
            Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
