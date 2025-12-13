"use client";

import { useState, useEffect, ReactNode, useMemo } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Drawer,
  Tooltip,
  Space,
} from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  FileTextOutlined,
  DashboardOutlined,
  TeamOutlined,
  TagOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  SecurityScanOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  FolderOutlined,
  DeploymentUnitOutlined,
  FileImageOutlined,
  SafetyCertificateOutlined,
  FireOutlined,
  AuditOutlined
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authProvider";
import { fetchUserProfile, UserProfile } from "@/lib/users-api";
import Image from "next/image";

const { Header, Sider, Content } = Layout;

interface Props {
  children: ReactNode;
  userRole?: "admin" | "department" | "employee";
}

export default function DashboardLayout({
  children,
  userRole = "admin",
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const pathname = usePathname();

  const { isAuthenticated, logout } = useAuth();

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setUserProfile(profile);
      } catch (error) {
        // Silently fail
      }
    };

    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  // Handle authentication state more carefully
  useEffect(() => {
    // Unique key for this specific path to avoid checking on every component re-render
    const pathKey = pathname ? `dashboard_auth_${pathname.replace(/\//g, '_')}` : 'dashboard_auth_root';
    
    if (sessionStorage.getItem(pathKey) === 'true') {
      return;
    }
    
    // Mark this specific path as checked
    sessionStorage.setItem(pathKey, 'true');
    
    // Only check authentication after a short delay to give auth state time to initialize
    const authCheckTimer = setTimeout(() => {
      if (!isAuthenticated && typeof window !== "undefined") {
        const hasAuthCookie = document.cookie.includes('auth=true');
        const hasToken = localStorage.getItem('docuflow_access_token');
        const hasUserData = localStorage.getItem('docuflow_user');
        
        const roleCookie = document.cookie.split('; ')
          .find(row => row.startsWith('user_role='))
          ?.split('=')[1];
        
        if (hasAuthCookie && hasToken && hasUserData) {
          try {
            const userData = JSON.parse(hasUserData);
            const role = userData.role?.toLowerCase();
            
            if (role) {
              window.location.href = `/${role}/dashboard?forceReload=true`;
              return;
            }
          } catch (e) {
            // Silently fail
          }
          
          if (roleCookie) {
            window.location.href = `/${roleCookie}/dashboard?forceReload=true`;
            return;
          }
          
          window.location.reload();
        } else {
          window.location.href = "/login";
        }
      }
    }, 300);
    
    return () => {
      clearTimeout(authCheckTimer);
    };
  }, [pathname, isAuthenticated]);

  // Toggle sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile drawer when changing routes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: <Link href={`/${userRole}/dashboard`}>Dashboard</Link>,
        path: `/${userRole}/dashboard`,
      },
      {
        key: "ocr",
        icon: <FireOutlined />,
        label: (
          <Link href={`/${userRole}/ocr`} className="ocr-menu-item">
            AI OCR
            <span className="hot-badge">HOT</span>
          </Link>
        ),
        path: `/${userRole}/ocr`,
      },
      {
        key: "documents",
        icon: <FileTextOutlined />,
        label: <Link href={`/${userRole}/documents`}>Documents</Link>,
        path: `/${userRole}/documents`,
      },
    ];

    // Profile is available to all roles
    const profileItem = {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link href={`/${userRole}/profile`}>My Profile</Link>,
      path: `/${userRole}/profile`,
    };

    // Additional items for admin only
    if (userRole === "admin") {
      return [
        ...baseItems,
        {
          key: "departments",
          icon: <AppstoreOutlined />,
          label: <Link href="/admin/departments">Departments</Link>,
          path: "/admin/departments",
        },
        {
          key: "tags",
          icon: <TagOutlined />,
          label: <Link href="/admin/tags">Tags</Link>,
          path: "/admin/tags",
        },
        {
          key: "users",
          icon: <TeamOutlined />,
          label: <Link href="/admin/users">Users</Link>,
          path: "/admin/users",
        },
        {
          key: "signatures",
          icon: <SecurityScanOutlined />,
          label: <Link href="/admin/signatures">Digital Sign</Link>,
          path: "/admin/signatures",
        },
        {
          key: "stamps",
          icon: <SafetyCertificateOutlined />,
          label: <Link href="/admin/stamps">Stamps</Link>,
          path: "/admin/stamps",
        },
        {
          key: "audit-log",
          icon: <AuditOutlined />,
          label: <Link href="/admin/audit-log">Audit Log</Link>,
          path: "/admin/audit-log",
        },
        profileItem,
      ];
    }

    // Additional items for department role
    if (userRole === "department") {
      return [
        ...baseItems,
        {
          key: "members",
          icon: <TeamOutlined />,
          label: <Link href="/department/members">Members</Link>,
          path: "/department/members",
        },
        {
          key: "permissions",
          icon: <SecurityScanOutlined />,
          label: <Link href="/department/permissions">Permissions</Link>,
          path: "/department/permissions",
        },
        {
          key: "activity-logs",
          icon: <ClockCircleOutlined />,
          label: <Link href="/department/activity-logs">Activity Logs</Link>,
          path: "/department/activity-logs",
        },
        profileItem,
      ];
    }

    // Return base items plus profile for other roles (employee)
    if (userRole === "employee") {
      return [
        ...baseItems,
        {
          key: "department",
          icon: <AppstoreOutlined />,
          label: <Link href="/employee/department">My Department</Link>,
          path: "/employee/department",
        },
        {
          key: "activities",
          icon: <ClockCircleOutlined />,
          label: <Link href="/employee/activities">My Activities</Link>,
          path: "/employee/activities",
        },
        profileItem,
      ];
    }

    // Return base items plus profile for other roles
    return [...baseItems, profileItem];
  };

  const navigationItems = getNavigationItems();

  // Handle responsive layout

  // User dropdown menu
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link href={`/${userRole}/profile`}>My Profile</Link>,
    },
    {
      type: "divider",
      key: "divider-1",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      onClick: () => {
        // Remove auth cookies directly before calling logout
        document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        
        // Clear any auth-related session storage items
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith('dashboard_auth_') || 
              key === 'user_authenticated' || 
              key === 'auth_status_checked') {
            sessionStorage.removeItem(key);
          }
        }
        
        // Now call the main logout function
        logout();
      },
    },
  ] as any;

  // Notifications dropdown content
  const notificationsMenuItems = [
    {
      key: "notification-header",
      label: (
        <div className="px-2 py-2 border-b border-gray-100">
          <span className="font-medium text-gray-800">Notifications</span>
        </div>
      ),
      disabled: true,
    },
    {
      key: "notification-1",
      label: (
        <div className="flex items-start py-2">
          <Avatar
            style={{ backgroundColor: "#1890ff" }}
            icon={<FileTextOutlined />}
            className="flex-shrink-0 mt-1"
          />
          <div className="ml-3 flex-1">
            <div className="font-medium">New document uploaded</div>
            <div className="text-gray-500 text-sm">
              Sarah Johnson uploaded &quot;Q3 Financial Report&quot;
            </div>
            <div className="text-gray-400 text-xs mt-1">15 minutes ago</div>
          </div>
        </div>
      ),
    },
    {
      key: "notification-2",
      label: (
        <div className="flex items-start py-2">
          <Avatar
            style={{ backgroundColor: "#52c41a" }}
            icon={<CheckCircleOutlined />}
            className="flex-shrink-0 mt-1"
          />
          <div className="ml-3 flex-1">
            <div className="font-medium">Document approved</div>
            <div className="text-gray-500 text-sm">
              Your document &quot;Marketing Strategy&quot; was approved by
              Michael Chen
            </div>
            <div className="text-gray-400 text-xs mt-1">2 hours ago</div>
          </div>
        </div>
      ),
    },
    {
      key: "notification-3",
      label: (
        <div className="flex items-start py-2">
          <Avatar
            style={{ backgroundColor: "#faad14" }}
            icon={<ExclamationCircleOutlined />}
            className="flex-shrink-0 mt-1"
          />
          <div className="ml-3 flex-1">
            <div className="font-medium">Approval requested</div>
            <div className="text-gray-500 text-sm">
              David Wilson requests your approval for &quot;System Architecture
              Documentation&quot;
            </div>
            <div className="text-gray-400 text-xs mt-1">Yesterday</div>
          </div>
        </div>
      ),
    },
    {
      type: "divider",
      key: "divider",
    },
    {
      key: "view-all",
      label: (
        <Link
          href="/notifications"
          className="text-orange-500 hover:text-orange-700 block text-center"
        >
          View all notifications
        </Link>
      ),
    },
  ] as any;

  // Memoize current menu key to prevent infinite re-renders
  const currentMenuKey = useMemo(() => {
    if (!pathname) return "dashboard";

    // Extract the second part of the path after userRole (e.g., /admin/documents => documents)
    const parts = pathname.split("/");
    if (parts.length >= 3) {
      return parts[2]; // Return the third segment (index 2)
    }

    return "dashboard"; // Default to dashboard
  }, [pathname]);

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="hidden md:block border-r border-gray-100 bg-white"
        theme="light"
        width={240}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div className="h-16 flex items-center justify-center px-4 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center">
            {collapsed ? (
              <Image
                src="/docuflow-logo-new.svg"
                alt="DocuFlow Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
            ) : (
              <>
                <Image
                  src="/docuflow-logo-new.svg"
                  alt="DocuFlow Logo"
                  width={140}
                  height={35}
                  className="h-8 w-auto"
                />
              </>
            )}
          </Link>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentMenuKey]}
          style={{ borderRight: 0, backgroundColor: "white" }}
          items={navigationItems}
          className="border-0"
          theme="light"
        />
      </Sider>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        width={240}
        styles={{
          body: { padding: 0, backgroundColor: "white" },
        }}
      >
        <div className="h-16 flex items-center justify-center px-4 py-4 border-b border-gray-100">
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
        <Menu
          mode="inline"
          selectedKeys={[currentMenuKey]}
          style={{ borderRight: 0, backgroundColor: "white" }}
          items={navigationItems}
          className="border-0"
          theme="light"
        />
      </Drawer>

      <Layout
        className="transition-all duration-300"
        style={{
          marginLeft: collapsed ? 80 : 240,
          marginRight: 0,
          width: "auto",
        }}
      >
        <Header
          className="px-4 py-0 bg-white border-b border-gray-100 flex items-center justify-between h-16 sticky top-0 z-10"
          style={{ width: "100%" }}
        >
          <div className="flex items-center">
            {/* Mobile menu toggle */}
            <Button
              type="text"
              icon={mobileOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden"
            />

            {/* Desktop sidebar toggle */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:block"
            />

            {/* Breadcrumb/navigation indicator */}
            <div className="ml-4 hidden sm:block">
              <Space>
                <Link href="/" className="text-gray-500 hover:text-orange-500">
                  <HomeOutlined />
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-600 font-medium">
                  {pathname?.includes("/dashboard") && "Dashboard"}
                  {pathname?.includes("/documents") && "Documents"}
                  {pathname?.includes("/users") && "Users"}
                  {pathname?.includes("/members") && "Members"}
                  {pathname?.includes("/permissions") && "Permissions"}
                  {pathname?.includes("/activity-logs") && "Activity Logs"}
                  {pathname?.includes("/roles-permissions") && "Roles & Permissions"}
                  {pathname?.includes("/workflows") && "Workflows"}
                  {pathname?.includes("/storage") && "Storage"}
                  {pathname?.includes("/tags") && "Tags"}
                  {pathname?.includes("/departments") && "Departments"}
                  {pathname?.includes("/stamps") && "Stamps"}
                  {pathname?.includes("/signatures") && "Digital Sign"}
                  {pathname?.includes("/department") && !pathname?.includes("/departments") && "My Department"}
                  {pathname?.includes("/activities") && "My Activities"}
                  {pathname?.includes("/profile") && "My Profile"}
                </span>
              </Space>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Dropdown
              menu={{ items: notificationsMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
              arrow
            >
              <Tooltip title="Notifications">
                <Button
                  type="text"
                  icon={
                    <Badge count={3} dot>
                      <BellOutlined style={{ fontSize: "18px" }} />
                    </Badge>
                  }
                  className="hover:bg-gray-50"
                />
              </Tooltip>
            </Dropdown>

            {/* User menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              open={userMenuOpen}
              onOpenChange={setUserMenuOpen}
              placement="bottomRight"
              arrow
            >
              <div className="flex items-center cursor-pointer ml-2 md:ml-6 group">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={userProfile?.avatar?.s3Url}
                  className="border-2 border-transparent group-hover:border-orange-300"
                />
                <div className="hidden md:flex flex-col ml-2">
                  <span className="text-gray-700 group-hover:text-orange-500 transition-colors text-sm font-medium">
                    {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Loading...'}
                  </span>
                  {userProfile?.department && userRole !== 'admin' && (
                    <span className="text-gray-500 text-xs font-semibold">
                      {userProfile.department.name}
                    </span>
                  )}
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
