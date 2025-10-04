"use client";

import { Button, Modal, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { mockLogin } from "@/lib/mockAuth";
import { useRouter } from "next/navigation";

export default function DevLoginWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleMockLogin = (userType: "admin" | "department" | "employee") => {
    mockLogin(userType);
    message.success(`Logged in as ${userType}`);
    setIsModalOpen(false);

    // Navigate to the appropriate dashboard based on role
    switch (userType) {
      case "admin":
        router.push("/admin/dashboard");
        break;
      case "department":
        router.push("/department/dashboard");
        break;
      case "employee":
        router.push("/employee/dashboard");
        break;
      default:
        router.push("/");
    }
  };

  // No need for additional descriptions, they're included inline

  return (
    <>
      <Button
        type="dashed"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center"
      >
        <UserOutlined className="mr-1" />
        Dev Login
      </Button>

      <Modal
        title="Development Mock Login"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <div className="py-4 space-y-6">
          <p className="text-gray-500">
            Choose a role to login as for development purposes:
          </p>
          <div className="space-y-4">
            <Button
              block
              className="h-12 text-left flex items-center"
              onClick={() => handleMockLogin("admin")}
            >
              <UserOutlined className="mr-2 text-blue-500" /> Admin
              <span className="text-sm text-gray-500 ml-2">
                (Full access to all features)
              </span>
            </Button>

            <Button
              block
              className="h-12 text-left flex items-center"
              onClick={() => handleMockLogin("department")}
            >
              <UserOutlined className="mr-2 text-orange-500" /> Department Head
              <span className="text-sm text-gray-500 ml-2">
                (Department management features)
              </span>
            </Button>

            <Button
              block
              className="h-12 text-left flex items-center"
              onClick={() => handleMockLogin("employee")}
            >
              <UserOutlined className="mr-2 text-green-500" /> Employee
              <span className="text-sm text-gray-500 ml-2">
                (Basic document access)
              </span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
