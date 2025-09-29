"use client";

import { useEffect } from "react";
import { Button, Result } from "antd";
import Link from "next/link";
import Image from "next/image";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

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
          status="500"
          title="Oops! Something went wrong."
          subTitle="Sorry, an unexpected error has occurred."
          extra={
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => reset()}
                type="primary"
                size="large"
                className="min-w-[120px]"
              >
                Try Again
              </Button>
              <Link href="/">
                <Button size="large" className="min-w-[120px]">
                  Back Home
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
