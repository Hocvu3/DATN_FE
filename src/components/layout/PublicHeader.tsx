"use client";

import { Button, Layout, Menu } from "antd";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuOutlined } from "@ant-design/icons";
import { usePathname } from "next/navigation";

const { Header } = Layout;

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
