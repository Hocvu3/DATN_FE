"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, Typography, Button, Spin } from "antd";

const { Title, Text } = Typography;

// Simple mock data
const mockDocuments = [
  {
    id: "1",
    title: "Q3 Financial Report",
    description: "Quarterly financial analysis and performance metrics",
    fileType: "pdf",
    department: "Finance",
  },
  {
    id: "2", 
    title: "Product Roadmap 2024",
    description: "Strategic product development plan for the upcoming year",
    fileType: "pptx",
    department: "Product",
  },
  {
    id: "3",
    title: "Employee Handbook 2024",
    description: "Updated company policies and procedures",
    fileType: "docx", 
    department: "HR",
  }
];

const TestDepartmentDocumentDetail: React.FC = () => {
  const params = useParams();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Department - Params:", params);
    console.log("Department - Document ID:", params.id);
    
    // Find document by ID
    const foundDocument = mockDocuments.find(doc => doc.id === params.id);
    console.log("Department - Found document:", foundDocument);
    
    setTimeout(() => {
      setDocument(foundDocument || null);
      setLoading(false);
    }, 1000);
  }, [params]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spin size="large" />
        <p>Loading document...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <Card>
          <Title level={4}>Document Not Found</Title>
          <Text>No document found with ID: {params.id}</Text>
          <div className="mt-4">
            <Button type="primary" href="/department/documents">
              Back to Documents
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <Title level={2}>[DEPARTMENT] {document.title}</Title>
        <Text type="secondary">{document.description}</Text>
        <div className="mt-4">
          <p><strong>Type:</strong> {document.fileType}</p>
          <p><strong>Department:</strong> {document.department}</p>
          <p><strong>ID:</strong> {document.id}</p>
        </div>
        <div className="mt-4">
          <Button type="primary" className="mr-2">
            Download
          </Button>
          <Button>
            Edit (Dept can edit draft/pending)
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TestDepartmentDocumentDetail;