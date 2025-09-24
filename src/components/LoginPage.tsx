import { FileText, Shield, Users, Database } from "lucide-react";
import LoginForm from "./LoginForm";
import loginBg from "@/assets/login-bg.jpg";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-brand relative overflow-hidden"
        style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-brand opacity-85"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-primary rounded-2xl shadow-glow">
                <FileText className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              DocuFlow
            </h1>
            <p className="text-xl text-brand-muted mb-2">
              Document Management System
            </p>
            <p className="text-brand-muted max-w-md">
              Streamline your document workflow with our intelligent management platform
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-sm">
            <div className="flex items-center space-x-3 text-brand-foreground">
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-sm">Secure & Encrypted</span>
            </div>
            <div className="flex items-center space-x-3 text-brand-foreground">
              <div className="p-2 bg-white/10 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-sm">Team Collaboration</span>
            </div>
            <div className="flex items-center space-x-3 text-brand-foreground">
              <div className="p-2 bg-white/10 rounded-lg">
                <Database className="h-5 w-5" />
              </div>
              <span className="text-sm">Smart Organization</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-gradient-subtle flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">DocuFlow</h1>
            <p className="text-muted-foreground">Document Management System</p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;