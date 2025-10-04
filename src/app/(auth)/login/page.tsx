import LoginForm from "@/components/auth/LoginForm";
import LoginAlert from "@/components/auth/LoginAlert";
import LoginSuccess from "@/components/auth/LoginSuccess";
import ClientDebug from "@/components/debug/ClientDebug";
import Link from "next/link";
import {
  SafetyOutlined,
  TeamOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Image from "next/image";

export const metadata = { title: "Sign In | DocuFlow" };

export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Independent notification components that work regardless of Toast */}
      <LoginAlert />
      <LoginSuccess />
      
      {/* Debug component wrapped in client component */}
      <ClientDebug />
      
      {/* Left side - Branding area */}
      <section className="relative hidden md:flex flex-col justify-center text-white bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-20 bg-pattern"></div>
        <div className="relative z-10 px-12 lg:px-16 py-20 h-full flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl grid place-items-center text-white text-3xl shadow-xl overflow-hidden">
                <Image
                  src="/favicon-new.svg"
                  alt="DocuFlow Icon"
                  width={64}
                  height={64}
                  className="w-full h-full"
                />
              </div>
              <h1 className="text-5xl font-bold tracking-tight">DocuFlow</h1>
            </div>

            <h2 className="text-2xl font-medium mb-6">
              Document Management System
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed">
              Streamline your document workflow with our intelligent management
              platform
            </p>

            <div className="mt-14 space-y-6">
              <Feature icon={<SafetyOutlined />} title="Secure & Encrypted" />
              <Feature icon={<TeamOutlined />} title="Team Collaboration" />
              <Feature icon={<AppstoreOutlined />} title="Smart Organization" />
            </div>
          </div>
        </div>
      </section>

      {/* Right side - Login form */}
      <section className="flex items-center justify-center p-6 md:p-0 bg-gray-50">
        <div className="w-full max-w-md px-8 py-10 md:py-12 bg-white shadow-lg rounded-xl">
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 h-16 w-16 rounded-full grid place-items-center text-white text-3xl shadow-sm overflow-hidden">
              <Image
                src="/favicon-new.svg"
                alt="DocuFlow Icon"
                width={64}
                height={64}
                className="w-full h-full"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-gray-500 mt-2">
              Sign in to access your document management system
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-gray-500">
            By continuing, you agree to our
            <Link
              href="#"
              className="text-orange-500 hover:text-orange-600 ml-1 font-medium"
            >
              Terms
            </Link>
            <span> and </span>
            <Link
              href="#"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-white/15 grid place-items-center text-xl shadow-lg">
        {icon}
      </div>
      <div className="text-lg font-medium">{title}</div>
    </div>
  );
}
