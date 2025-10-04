"use client";

import { Layout, Typography, Row, Col, Divider, Space } from "antd";
import {
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  FacebookOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";

const { Title, Text, Paragraph } = Typography;

const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Layout.Footer className="bg-gray-50 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <Row gutter={[48, 32]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="mb-6">
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
            <Paragraph className="text-gray-600 mb-4">
              Secure document management system for modern enterprises, ensuring
              data protection and regulatory compliance.
            </Paragraph>
            <Space size="large">
              <Link
                href="https://github.com/"
                className="text-gray-500 hover:text-orange-500"
              >
                <GithubOutlined style={{ fontSize: "1.5rem" }} />
              </Link>
              <Link
                href="https://twitter.com/"
                className="text-gray-500 hover:text-orange-500"
              >
                <TwitterOutlined style={{ fontSize: "1.5rem" }} />
              </Link>
              <Link
                href="https://linkedin.com/"
                className="text-gray-500 hover:text-orange-500"
              >
                <LinkedinOutlined style={{ fontSize: "1.5rem" }} />
              </Link>
              <Link
                href="https://facebook.com/"
                className="text-gray-500 hover:text-orange-500"
              >
                <FacebookOutlined style={{ fontSize: "1.5rem" }} />
              </Link>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={5} className="mb-4 !text-gray-800">
              Product
            </Title>
            <ul className="space-y-3">
              {[
                { label: "Features", href: "/features" },
                { label: "Security", href: "/security" },
                { label: "Pricing", href: "/pricing" },
                { label: "Testimonials", href: "/testimonials" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-orange-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={5} className="mb-4 !text-gray-800">
              Resources
            </Title>
            <ul className="space-y-3">
              {[
                { label: "Documentation", href: "/docs" },
                { label: "Knowledge Base", href: "/knowledge-base" },
                { label: "API Reference", href: "/api-reference" },
                { label: "Security Policy", href: "/security-policy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-orange-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={5} className="mb-4 !text-gray-800">
              Company
            </Title>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Careers", href: "/careers" },
                { label: "Contact", href: "/contact" },
                { label: "Blog", href: "/blog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-orange-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>
        </Row>

        <Divider className="my-8 border-gray-200" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Text className="text-gray-500">
            &copy; {currentYear} Hocvu. All rights reserved.
          </Text>
          <div className="flex flex-wrap gap-6">
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-orange-500"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-orange-500">
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-gray-600 hover:text-orange-500"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </Layout.Footer>
  );
};

export default PublicFooter;
