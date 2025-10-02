"use client";

import { Typography, Row, Col, Card, Avatar, Button } from "antd";
import {
  TeamOutlined,
  SafetyOutlined,
  RocketOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import Image from "next/image";

const { Title, Paragraph } = Typography;

export default function AboutPage() {
  // Team members data
  const team = [
    {
      name: "Alex Johnson",
      role: "CEO & Co-Founder",
      bio: "Former security consultant with 15 years experience in document management systems.",
    },
    {
      name: "Sarah Lee",
      role: "CTO",
      bio: "PostgreSQL expert and database security specialist with multiple certifications.",
    },
    {
      name: "Michael Chen",
      role: "Head of Product",
      bio: "Product leader focused on intuitive UX design and streamlined workflows.",
    },
    {
      name: "Elena Rodriguez",
      role: "Security Director",
      bio: "Former cybersecurity analyst with expertise in compliance frameworks.",
    },
  ];

  // Company values
  const values = [
    {
      icon: <SafetyOutlined className="text-4xl text-orange-500" />,
      title: "Security First",
      description:
        "We build with security as our foundation, not an afterthought.",
    },
    {
      icon: <TeamOutlined className="text-4xl text-orange-500" />,
      title: "Customer Focus",
      description:
        "Our solutions are developed based on real customer needs and feedback.",
    },
    {
      icon: <HeartOutlined className="text-4xl text-orange-500" />,
      title: "Integrity",
      description:
        "We maintain the highest ethical standards in all our operations.",
    },
    {
      icon: <RocketOutlined className="text-4xl text-orange-500" />,
      title: "Innovation",
      description:
        "We continuously improve and evolve our technology to stay ahead.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Title
              level={1}
              className="!text-4xl md:!text-5xl font-bold !mb-6 text-gray-900"
            >
              About DocuFlow
            </Title>
            <Paragraph className="text-lg text-gray-700 max-w-3xl mx-auto">
              We&apos;re on a mission to make document management secure,
              efficient, and compliant for modern enterprises around the world.
            </Paragraph>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div>
                <Title
                  level={2}
                  className="!text-3xl font-bold !mb-6 text-gray-900"
                >
                  Our Story
                </Title>
                <Paragraph className="text-lg text-gray-700 mb-4">
                  Founded in 2021, DocuFlow was created to address the critical
                  need for secure document management systems that meet modern
                  regulatory requirements while remaining user-friendly and
                  efficient.
                </Paragraph>
                <Paragraph className="text-lg text-gray-700 mb-4">
                  Our founders, with backgrounds in cybersecurity and enterprise
                  software, recognized that many organizations struggle with
                  document management systems that either prioritize features
                  over security or security over usability.
                </Paragraph>
                <Paragraph className="text-lg text-gray-700">
                  Today, DocuFlow serves hundreds of organizations worldwide,
                  from small teams to large enterprises, all with a common need:
                  secure, compliant, and efficient document management.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="flex justify-center">
                <Image
                  src="/document-illustration.svg"
                  alt="Our Story"
                  className="rounded-lg shadow-lg"
                  width={500}
                  height={400}
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title
              level={2}
              className="!text-3xl font-bold !mb-6 text-gray-900"
            >
              Our Values
            </Title>
            <Paragraph className="text-lg text-gray-700 max-w-3xl mx-auto">
              The principles that guide everything we do at DocuFlow
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {values.map((value, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  variant="borderless"
                  className="h-full text-center hover:shadow-md transition-all"
                >
                  <div className="mb-4">{value.icon}</div>
                  <Title level={4} className="!mb-2">
                    {value.title}
                  </Title>
                  <Paragraph className="text-gray-600">
                    {value.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title
              level={2}
              className="!text-3xl font-bold !mb-6 text-gray-900"
            >
              Meet Our Leadership
            </Title>
            <Paragraph className="text-lg text-gray-700 max-w-3xl mx-auto">
              The experienced team driving DocuFlow&apos;s innovation and
              success
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {team.map((member, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  variant="borderless"
                  className="text-center hover:shadow-md transition-all"
                >
                  <Avatar size={100} className="mb-4 bg-orange-500">
                    {member.name.charAt(0)}
                  </Avatar>
                  <Title level={4} className="!mb-1">
                    {member.name}
                  </Title>
                  <div className="text-orange-500 font-medium mb-3">
                    {member.role}
                  </div>
                  <Paragraph className="text-gray-600">{member.bio}</Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={8}>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">
                  100+
                </div>
                <div className="text-gray-700 text-lg">Enterprise Clients</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">
                  10M+
                </div>
                <div className="text-gray-700 text-lg">Documents Managed</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">
                  25+
                </div>
                <div className="text-gray-700 text-lg">Countries Served</div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Title level={2} className="!text-3xl font-bold !mb-6 text-gray-900">
            Ready to experience DocuFlow?
          </Title>
          <Paragraph className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Join hundreds of organizations that trust us with their document
            management needs. Start your journey today.
          </Paragraph>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              type="primary"
              size="large"
              className="bg-orange-500 border-orange-500 hover:bg-orange-600"
            >
              Start Free Trial
            </Button>
            <Button size="large">Contact Sales</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
