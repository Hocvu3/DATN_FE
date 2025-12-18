"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/documents");
  }, [router]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh" 
    }}>
      <Spin size="large" />
    </div>
  );
}
  // Removed unused scroll effect

  // Features data
  const features = [
    {
      icon: <FileTextOutlined className="text-3xl text-blue-500" />,
      title: "Document Management",
      description:
        "Centralize all your documents in one secure location with powerful organization tools.",
    },
    {
      icon: <SecurityScanOutlined className="text-3xl text-green-500" />,
      title: "Advanced Security",
      description:
        "Enterprise-grade security with PostgreSQL RLS, encryption, and detailed access control.",
    },
    {
      icon: <TeamOutlined className="text-3xl text-orange-500" />,
      title: "Team Collaboration",
      description:
        "Streamline document workflows with approval processes and team permissions.",
    },
    {
      icon: <SearchOutlined className="text-3xl text-purple-500" />,
      title: "Intelligent Search",
      description:
        "Full-text search with OCR processing to find content within documents instantly.",
    },
  ];

  // Statistics
  const stats = [
    { title: "Documents Managed", value: "10M+" },
    { title: "Security Measures", value: "12+" },
    { title: "Customer Satisfaction", value: "99%" },
    { title: "Global Companies", value: "500+" },
  ];

  // Testimonials
  const testimonials = [
    {
      quote:
        "DocuFlow transformed our document management process. The security features give us peace of mind with sensitive information.",
      author: "Sarah Johnson",
      position: "CIO, TechCorp Inc.",
    },
    {
      quote:
        "The workflow automation capabilities have reduced our document processing time by 60%. A game-changer for our compliance department.",
      author: "Michael Chen",
      position: "Compliance Director, FinSecure",
    },
    {
      quote:
        "Implementing DocuFlow was seamless. The PostgreSQL security features are exactly what we needed for our regulatory requirements.",
      author: "Elena Rodriguez",
      position: "IT Security Manager, MedLife",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-50 to-orange-100 py-20 md:py-32">
        <div className="absolute inset-0 opacity-10 bg-pattern"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center md:text-left md:w-2/3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
              Secure Document Management for Modern Enterprises
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-700">
              Streamline workflows, ensure compliance, and protect sensitive
              information with our advanced document management system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                type="primary"
                size="large"
                className="bg-orange-500 border-orange-500 hover:bg-orange-600 h-12 px-8 text-base"
              >
                <Link href="/login?force=true">Get Started</Link>
              </Button>
              <Button size="large" className="h-12 px-8 text-base">
                <Link href="/documents">Browse Documents</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave shape divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-16"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,0,0,0c0,0,0,0,0,0z"
              fill="white"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Title
              level={2}
              className="!text-3xl md:!text-4xl !font-bold !text-gray-800"
            >
              Enterprise-Grade Document Management
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              DocuFlow combines powerful features with industry-leading security
              to deliver a comprehensive document management solution
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} key={index}>
                <Card
                  className="h-full transition-all duration-300 hover:shadow-md"
                  variant="borderless"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6">{feature.icon}</div>
                    <Title
                      level={3}
                      className="!text-xl !font-semibold !text-gray-800 mb-4"
                    >
                      {feature.title}
                    </Title>
                    <Paragraph className="text-gray-600 mb-6 flex-grow">
                      {feature.description}
                    </Paragraph>
                    <Link
                      href="/documents"
                      className="text-primary-500 hover:text-primary-600 font-medium flex items-center"
                    >
                      Learn more <RightOutlined className="ml-1" />
                    </Link>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[24, 24]} className="justify-center">
            {stats.map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <Card variant="borderless" className="text-center">
                  <Statistic
                    value={stat.value}
                    title={<span className="text-gray-600">{stat.title}</span>}
                    valueStyle={{
                      color: "#1a56db",
                      fontSize: "2rem",
                      fontWeight: "bold",
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Title
              level={2}
              className="!text-3xl md:!text-4xl !font-bold !text-gray-800"
            >
              Enterprise Security Features
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              Leveraging PostgreSQL&apos;s advanced security capabilities to
              ensure your documents remain protected
            </Paragraph>
          </div>

          <Row gutter={[24, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div className="bg-white flex items-center justify-center rounded-lg p-8 h-64 shadow-md">
                <FileTextOutlined className="text-5xl text-orange-500" />
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <List
                itemLayout="horizontal"
                dataSource={[
                  {
                    title: "Row-Level Security (RLS)",
                    description:
                      "Fine-grained access control at the database level",
                  },
                  {
                    title: "Encrypted Data Fields",
                    description:
                      "pgcrypto implementation for sensitive information",
                  },
                  {
                    title: "Comprehensive Audit Logging",
                    description:
                      "Complete visibility of all document access and changes",
                  },
                  {
                    title: "Role-Based Access Control",
                    description:
                      "Precisely define user permissions and restrictions",
                  },
                  {
                    title: "TLS Encrypted Connections",
                    description:
                      "Secure data transmission between all system components",
                  },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <CheckCircleOutlined className="text-orange-500 text-xl" />
                      }
                      title={
                        <span className="text-lg font-medium">
                          {item.title}
                        </span>
                      }
                      description={
                        <span className="text-gray-600">
                          {item.description}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />

              <Button
                type="primary"
                className="mt-8 bg-orange-500 border-orange-500 hover:bg-orange-600"
                size="large"
              >
                <Link href="/documents">View Documents</Link>
              </Button>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Title
              level={2}
              className="!text-3xl md:!text-4xl !font-bold !text-gray-800"
            >
              Trusted by Industry Leaders
            </Title>
            <Paragraph className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
              See what our customers have to say about DocuFlow
            </Paragraph>
          </div>

          <Carousel autoplay>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="px-4">
                <Card
                  className="bg-gray-50 border-none shadow-sm"
                  variant="borderless"
                >
                  <div className="text-center py-6">
                    <div className="text-xl italic text-gray-700 mb-6">
                      &ldquo;{testimonial.quote}&rdquo;
                    </div>
                    <div className="font-medium text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-gray-500">{testimonial.position}</div>
                  </div>
                </Card>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Title
            level={2}
            className="!text-3xl md:!text-4xl !font-bold !text-white"
          >
            Ready to transform your document workflow?
          </Title>
          <Paragraph className="text-xl text-orange-100 max-w-3xl mx-auto mt-4 mb-10">
            Join hundreds of organizations that trust DocuFlow for secure
            document management
          </Paragraph>
          <Space size="large">
            <Button size="large" className="h-12 px-8 text-base">
              <Link href="/contact">Request Demo</Link>
            </Button>
            <Button
              type="primary"
              size="large"
              className="h-12 px-8 text-base bg-white text-orange-500 border-white hover:bg-orange-50"
            >
              <Link href="/register">Sign Up Now</Link>
            </Button>
          </Space>
        </div>
      </section>
    </div>
  );
}
