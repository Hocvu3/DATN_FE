import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import { FileTextFilled, SafetyOutlined, TeamOutlined, DatabaseOutlined } from "@ant-design/icons";

export const metadata = { title: "Sign In | DocuFlow" };

export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <section className="relative hidden md:flex flex-col justify-center p-16 lg:p-24 text-white">
        <div className="absolute inset-0 bg-[url('/login-hero.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 [background:radial-gradient(900px_500px_at_160px_160px,rgba(0,0,0,0.35),transparent_60%),radial-gradient(900px_500px_at_520px_420px,rgba(0,0,0,0.28),transparent_60%)]" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative">
          <div className="max-w-2xl">
            <div className="mb-10 flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-orange-500 grid place-items-center text-white text-3xl shadow-xl shadow-black/30">
                <FileTextFilled />
              </div>
              <h1 className="text-6xl font-semibold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">DocuFlow</h1>
            </div>
            <h2 className="text-2xl opacity-95 mb-4">Document Management System</h2>
            <p className="opacity-90 leading-relaxed max-w-2xl">
              Streamline your document workflow with our intelligent management platform
            </p>
            <div className="mt-12 space-y-6">
              <Feature icon={<SafetyOutlined />} title="Secure & Encrypted" />
              <Feature icon={<TeamOutlined />} title="Team Collaboration" />
              <Feature icon={<DatabaseOutlined />} title="Smart Organization" />
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8 md:p-10 border border-gray-100">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-orange-500 grid place-items-center text-white text-2xl shadow-sm">
              <FileTextFilled />
            </div>
            <h2 className="text-2xl font-semibold">Welcome Back!</h2>
            <p className="text-gray-500 mt-1">Sign in to access your document management system</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            By continuing, you agree to our
            <Link href="#" className="text-orange-500 ml-1">Terms</Link>
            <span> and </span>
            <Link href="#" className="text-orange-500">Privacy Policy</Link>
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
      <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-[1px] ring-1 ring-white/15 grid place-items-center text-xl text-white/95 shadow-sm">
        {icon}
      </div>
      <div className="text-lg drop-shadow-sm">{title}</div>
    </div>
  );
}


