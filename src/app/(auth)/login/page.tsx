import LoginForm from "@/components/auth/LoginForm";
import LoginAlert from "@/components/auth/LoginAlert";
import LoginSuccess from "@/components/auth/LoginSuccess";
import ClientDebug from "@/components/debug/ClientDebug";
import Link from "next/link";
import {
  SafetyOutlined,
  RobotOutlined,
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
          <div className="max-w-md mx-auto space-y-12">
            {/* Logo & Title */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
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

              <div>
                <h2 className="text-2xl font-medium mb-3">
                  Document Management System
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Streamline your document workflow with intelligent automation
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Feature 
                  icon={<SafetyOutlined />} 
                  title="Secured & Encrypted" 
                  description="Enterprise-grade security with end-to-end encryption to protect your sensitive documents"
                />
                <Feature 
                  icon={<RobotOutlined />} 
                  title="AI Assistant" 
                  description="Smart OCR and document analysis powered by artificial intelligence"
                />
              </div>
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

function Feature({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string;
  description?: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="h-14 w-14 shrink-0 rounded-xl bg-white/15 grid place-items-center text-2xl shadow-lg backdrop-blur-sm">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xl font-semibold mb-1">{title}</div>
        {description && (
          <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
