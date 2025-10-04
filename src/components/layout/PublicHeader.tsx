"use client";

import { Button, Layout, Menu, Popover, Switch, message } from "antd";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuOutlined, BugOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";

const { Header } = Layout;

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check for dev mode in localStorage on component mount
  useEffect(() => {
    const storedDevMode = localStorage.getItem("devMode") === "true";
    setDevMode(storedDevMode);
  }, []);

  // Define navigation menu items
  const navigationItems = [
    {
      key: "/home",
      label: <Link href="/home">Home</Link>,
    },
    {
      key: "/documents",
      label: <Link href="/documents">Documents</Link>,
    },
    {
      key: "/about",
      label: <Link href="/about">About</Link>,
    },
    {
      key: "/contact",
      label: <Link href="/contact">Contact</Link>,
    },
  ];

  const mobileMenuItems = [
    ...navigationItems,
    {
      key: "/login",
      label: <Link href="/login?force=true">Login</Link>,
    },
  ];

  // Toggle dev mode handler
  const handleDevModeToggle = (checked: boolean) => {
    setDevMode(checked);
    localStorage.setItem("devMode", checked.toString());
    message.success(`Dev Mode ${checked ? "enabled" : "disabled"}`);
  };

  // Handle dev mode login click
  const handleDevModeLogin = (role: string) => {
    // Clear any existing auth data first
    localStorage.clear();
    
    // Clear existing cookies
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    
    // Save authentication tokens (for auth middleware)
    localStorage.setItem("docuflow_access_token", "mock-token-" + role);
    localStorage.setItem("docuflow_refresh_token", "mock-refresh-" + role);

    // Use consistent role capitalization
    const normalizedRole = role.toLowerCase();

    // Create mock user data based on role
    const mockUsers = {
      admin: {
        id: "mock-admin-001",
        email: "admin@docuflow.com",
        role: "admin",
        name: "System Administrator",
        department: "Information Technology",
      },
      employee: {
        id: "mock-employee-001", 
        email: "employee@docuflow.com",
        role: "employee",
        name: "John Doe",
        department: "Human Resources",
      },
      department: {
        id: "mock-dept-manager-001",
        email: "dept.manager@docuflow.com", 
        role: "department",
        name: "Department Manager",
        department: "Finance",
      }
    };

    // Save user data to localStorage
    localStorage.setItem(
      "docuflow_user",
      JSON.stringify(mockUsers[normalizedRole as keyof typeof mockUsers])
    );

    // Set auth cookie for middleware
    document.cookie = "auth=true; path=/; max-age=604800; SameSite=Lax;";
    
    // IMPORTANT: Set user_role cookie for middleware
    document.cookie = `user_role=${normalizedRole}; path=/; max-age=604800; SameSite=Lax;`;
    
    // Debug: Check if cookies were set
    console.log("Dev Mode Login - Cookies set:");
    console.log("Auth cookie:", document.cookie.includes('auth=true'));
    console.log("Role cookie:", document.cookie.split('; ').find(row => row.startsWith('user_role=')));
    console.log("All cookies:", document.cookie);

    message.success(`Logged in as ${role}`);

    // Add a small delay to ensure cookies are set
    setTimeout(() => {
      // Force reload to clear any cached auth state
      window.location.href = `/${normalizedRole}/dashboard`;
    }, 200);
  };

  // Dev mode content
  const devModeContent = (
    <div className="p-2 flex flex-col gap-3">
      <div className="flex items-center justify-between mb-2">
        <span>Dev Mode</span>
        <Switch checked={devMode} onChange={handleDevModeToggle} />
      </div>
      {devMode && (
        <>
          <Button
            onClick={() => handleDevModeLogin("admin")}
            className="w-full"
          >
            Login as Admin
          </Button>
          <Button
            onClick={() => handleDevModeLogin("employee")}
            className="w-full"
          >
            Login as Employee
          </Button>
          <Button
            onClick={() => handleDevModeLogin("department")}
            className="w-full"
          >
            Login as Department
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Header className="bg-white shadow-md px-4 h-16 flex items-center">
      <div className="container mx-auto flex justify-between items-center h-full">
        <div className="flex items-center">
          <Link href="/home" className="flex items-center">
            <Image
              src="/docuflow-logo-new.svg"
              alt="DocuFlow Logo"
              width={140}
              height={35}
              className="h-8 w-auto"
            />
          </Link>
          <Menu
            mode="horizontal"
            className="hidden md:flex ml-8 border-0"
            selectedKeys={[pathname]}
            items={navigationItems}
            style={{ backgroundColor: "white" }}
          />
        </div>
        <div className="hidden md:flex items-center">
          <Button
            type="primary"
            className="mr-2 bg-orange-500 border-orange-500 hover:bg-orange-600"
          >
            <Link href="/login?force=true">Login</Link>
          </Button>
          <Popover
            content={devModeContent}
            title="Developer Options"
            trigger="click"
            placement="bottomRight"
          >
            <Button
              icon={<BugOutlined />}
              className={`${devMode ? "bg-blue-100" : ""}`}
            />
          </Popover>
        </div>
        <div className="md:hidden">
          <Button onClick={toggleMenu} icon={<MenuOutlined />}></Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white p-4 absolute top-16 left-0 right-0 z-50 shadow-md">
          <Menu
            mode="vertical"
            selectedKeys={[pathname]}
            items={mobileMenuItems}
          />
        </div>
      )}
    </Header>
  );
}
