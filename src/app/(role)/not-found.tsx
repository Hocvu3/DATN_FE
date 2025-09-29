"use client";

import { Button, Result } from "antd";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-6">
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
            <Button
              size="large"
              className="min-w-[120px]"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        }
      />
    </div>
  );
}
