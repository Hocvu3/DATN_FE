import { Layout, Menu, Avatar, Dropdown, Badge, Button } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  FileOutlined,
  UserOutlined,
  TagsOutlined,
  BellOutlined,
  SignatureOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/dashboard.css";
import { useAuth } from "@/lib/authProvider";

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  // Check if the window is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Menu items for admin
  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: "/admin/departments",
      icon: <TeamOutlined />,
      label: <Link href="/admin/departments">Departments</Link>,
    },
    {
      key: "/admin/documents",
      icon: <FileOutlined />,
      label: <Link href="/admin/documents">Documents</Link>,
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: <Link href="/admin/users">Users</Link>,
    },
    {
      key: "/admin/tags",
      icon: <TagsOutlined />,
      label: <Link href="/admin/tags">Tags</Link>,
    },
    {
      key: "/admin/signatures",
      icon: <SignatureOutlined />,
      label: <Link href="/admin/signatures">Signatures</Link>,
    },
    {
      key: "/admin/profile",
      icon: <UserOutlined />,
      label: <Link href="/admin/profile">Profile</Link>,
    },
  ];

  // Notifications dropdown
  const notifications = [
    {
      id: 1,
      title: "New document uploaded",
      read: false,
    },
    {
      id: 2,
      title: "Document approval request",
      read: true,
    },
    {
      id: 3,
      title: "Signature requested",
      read: false,
    },
  ];

  const notificationItems = {
    items: notifications.map((notification) => ({
      key: notification.id,
      label: (
        <div className="flex items-center justify-between py-2">
          <span className={notification.read ? "text-gray-500" : "font-bold"}>
            {notification.title}
          </span>
          {!notification.read && (
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          )}
        </div>
      ),
    })),
  };

  // User dropdown
  const userMenuItems = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: <Link href="/admin/profile">Profile</Link>,
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: <div onClick={() => logout()}>Logout</div>,
      },
    ],
  };

  // Find unread notification count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        }}
        width={256}
        theme="light"
      >
        <div className="text-center p-4">
          <h1 className="text-xl font-bold text-orange-500">
            {!collapsed ? "DocuFlow" : "DF"}
          </h1>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout
        style={{ marginLeft: collapsed ? 80 : 256, transition: "all 0.2s" }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 999,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 48, height: 48 }}
          />
          <div className="flex items-center space-x-4">
            <Dropdown menu={notificationItems} placement="bottomRight">
              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: "18px" }} />}
                />
              </Badge>
            </Dropdown>
            <Dropdown menu={userMenuItems} placement="bottomRight">
              <div className="cursor-pointer flex items-center">
                <Avatar icon={<UserOutlined />} className="mr-2" />
                {!isMobile && <span className="font-medium">Admin User</span>}
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            borderRadius: "4px",
            minHeight: 280,
            overflow: "initial",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
