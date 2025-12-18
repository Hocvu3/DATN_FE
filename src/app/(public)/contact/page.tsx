"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function ContactPage() {
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
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Contact information
  const contactInfo = [
    {
      icon: <EnvironmentOutlined className="text-2xl text-orange-500" />,
      title: "Address",
      content: "123 Business Avenue, Tech District, San Francisco, CA 94107",
    },
    {
      icon: <MailOutlined className="text-2xl text-orange-500" />,
      title: "Email",
      content: "contact@docuflow.example.com",
    },
    {
      icon: <PhoneOutlined className="text-2xl text-orange-500" />,
      title: "Phone",
      content: "+1 (555) 123-4567",
    },
    {
      icon: <GlobalOutlined className="text-2xl text-orange-500" />,
      title: "Working Hours",
      content: "Monday-Friday: 9AM - 5PM (PST)",
    },
  ];

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // In a real app, this would be an API call

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success(
        "Your message has been sent. We'll get back to you soon!"
      );
      form.resetFields();
    } catch (error) {
      message.error(
        "There was an error sending your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              Contact Us
            </Title>
            <Paragraph className="text-lg text-gray-700 max-w-3xl mx-auto">
              Have questions about DocuFlow? Our team is here to help you with
              any inquiries about our platform or services.
            </Paragraph>
          </div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              <Card variant="borderless" className="shadow-md">
                <Title
                  level={2}
                  className="!text-2xl font-bold !mb-6 text-gray-900"
                >
                  Send Us a Message
                </Title>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  requiredMark={false}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        label="Your Name"
                        rules={[
                          { required: true, message: "Please enter your name" },
                        ]}
                      >
                        <Input size="large" placeholder="John Doe" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your email",
                          },
                          {
                            type: "email",
                            message: "Please enter a valid email",
                          },
                        ]}
                      >
                        <Input
                          size="large"
                          placeholder="john.doe@example.com"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="subject"
                    label="Subject"
                    rules={[
                      { required: true, message: "Please select a subject" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="What is your inquiry about?"
                    >
                      <Option value="general">General Inquiry</Option>
                      <Option value="support">Technical Support</Option>
                      <Option value="sales">Sales Information</Option>
                      <Option value="demo">Request a Demo</Option>
                      <Option value="partnership">
                        Partnership Opportunities
                      </Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label="Message"
                    rules={[
                      { required: true, message: "Please enter your message" },
                    ]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Please describe how we can help you..."
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={submitting}
                      icon={<SendOutlined />}
                      className="bg-orange-500 border-orange-500 hover:bg-orange-600"
                    >
                      Send Message
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <Card key={index} variant="borderless" className="shadow-sm">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">{item.icon}</div>
                      <div>
                        <Title level={4} className="!text-lg !mb-1">
                          {item.title}
                        </Title>
                        <Paragraph className="text-gray-600 !mb-0">
                          {item.content}
                        </Paragraph>
                      </div>
                    </div>
                  </Card>
                ))}

                <Card variant="borderless" className="shadow-sm bg-orange-50">
                  <Title level={4} className="!text-lg !mb-3">
                    Need immediate assistance?
                  </Title>
                  <Paragraph className="text-gray-600 mb-4">
                    Our customer support team is available during business hours
                    for urgent inquiries.
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    className="bg-orange-500 border-orange-500 hover:bg-orange-600"
                  >
                    Live Chat
                  </Button>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Title
              level={2}
              className="!text-3xl font-bold !mb-6 text-gray-900"
            >
              Visit Our Office
            </Title>
            <Paragraph className="text-lg text-gray-700 max-w-3xl mx-auto">
              We&apos;re located in the heart of San Francisco&apos;s tech
              district.
            </Paragraph>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg h-[400px] bg-gray-200 flex items-center justify-center">
            {/* In a real app, this would be an actual map component */}
            <div className="text-center p-6">
              <EnvironmentOutlined className="text-5xl text-orange-500 mb-4" />
              <Paragraph className="text-lg">
                Interactive Map Would Be Displayed Here
              </Paragraph>
              <Button
                type="primary"
                className="mt-4 bg-orange-500 border-orange-500 hover:bg-orange-600"
              >
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Title
              level={2}
              className="!text-3xl font-bold !mb-6 text-gray-900"
            >
              Frequently Asked Questions
            </Title>
            <Paragraph className="text-lg text-gray-700 max-w-3xl mx-auto">
              Find quick answers to common questions about our services.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {[
              {
                question: "What industries does DocuFlow serve?",
                answer:
                  "DocuFlow serves a wide range of industries including healthcare, financial services, legal, government, education, and manufacturing - any organization that needs secure document management with compliance features.",
              },
              {
                question: "Is DocuFlow compliant with industry regulations?",
                answer:
                  "Yes, DocuFlow is built with compliance in mind. We adhere to GDPR, HIPAA, SOC 2, and other regulatory standards to ensure your document management meets industry requirements.",
              },
              {
                question: "Can I try DocuFlow before purchasing?",
                answer:
                  "Absolutely! We offer a fully-featured 14-day free trial with no credit card required. You can also request a personalized demo with our team.",
              },
              {
                question: "What kind of support does DocuFlow provide?",
                answer:
                  "We offer multiple tiers of support including standard business hours support, premium 24/7 support, and dedicated account management for enterprise customers.",
              },
            ].map((faq, index) => (
              <Col xs={24} md={12} key={index}>
                <Card
                  variant="borderless"
                  className="h-full shadow-sm hover:shadow-md transition-all"
                >
                  <Title level={4} className="!text-lg !mb-3">
                    {faq.question}
                  </Title>
                  <Paragraph className="text-gray-600 !mb-0">
                    {faq.answer}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-10">
            <Paragraph className="text-gray-700 mb-4">
              Don&apos;t see your question here?
            </Paragraph>
            <Button size="large">View All FAQs</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
