"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DocumentDetailPage from "../../../../../components/documents/DocumentDetailPage";
import EditDocumentModal from "../../../../../components/documents/EditDocumentModal";
import { message } from "antd";

// Mock data - same structure as in documents listing
const mockDocuments = [
  {
    id: "1",
    title: "Q3 Financial Report",
    description: "Quarterly financial analysis and performance metrics",
    fileType: "pdf",
    size: 2048576,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
    tags: ["Finance", "Q3", "Report"],
    status: "published" as const,
    department: "Finance",
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop",
    owner: {
      id: "user1",
      name: "John Smith",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
    }
  },
  {
    id: "2", 
    title: "Product Roadmap 2024",
    description: "Strategic product development plan for the upcoming year",
    fileType: "pptx",
    size: 5242880,
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
    tags: ["Product", "Strategy", "2024"],
    status: "approved" as const,
    department: "Product",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
    owner: {
      id: "user2",
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
    }
  },
  {
    id: "3",
    title: "Employee Handbook 2024",
    description: "Updated company policies and procedures",
    fileType: "docx", 
    size: 1572864,
    createdAt: "2024-01-05T11:00:00Z",
    updatedAt: "2024-01-12T10:30:00Z",
    tags: ["HR", "Policies", "Handbook"],
    status: "draft" as const,
    department: "HR",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop",
    owner: {
      id: "user3",
      name: "Mike Wilson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face"
    }
  },
  {
    id: "4",
    title: "Marketing Campaign Analysis",
    description: "Performance analysis of recent marketing initiatives",
    fileType: "xlsx",
    size: 3145728,
    createdAt: "2024-01-08T14:30:00Z", 
    updatedAt: "2024-01-15T09:20:00Z",
    tags: ["Marketing", "Analytics", "Campaign"],
    status: "pending_approval" as const,
    department: "Marketing",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
    owner: {
      id: "user4",
      name: "Emily Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face"
    }
  },
  {
    id: "5",
    title: "Technical Architecture Guide",
    description: "System architecture documentation and guidelines",
    fileType: "pdf",
    size: 4194304,
    createdAt: "2024-01-12T16:00:00Z",
    updatedAt: "2024-01-18T11:15:00Z", 
    tags: ["Technical", "Architecture", "Documentation"],
    status: "published" as const,
    department: "Engineering",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=200&fit=crop",
    owner: {
      id: "user5",
      name: "David Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
    }
  },
  {
    id: "6",
    title: "Sales Performance Dashboard",
    description: "Monthly sales metrics and KPI tracking",
    fileType: "xlsx",
    size: 2621440,
    createdAt: "2024-01-20T08:45:00Z",
    updatedAt: "2024-01-22T15:30:00Z",
    tags: ["Sales", "KPI", "Dashboard"],
    status: "approved" as const, 
    department: "Sales",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
    owner: {
      id: "user6",
      name: "Lisa Anderson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
    }
  }
];

const DepartmentDocumentDetail: React.FC = () => {
  const params = useParams();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Mock data for dropdowns
  const departments = [
    { value: "Finance", label: "Finance" },
    { value: "HR", label: "Human Resources" },
    { value: "IT", label: "Information Technology" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Product", label: "Product" },
    { value: "Engineering", label: "Engineering" }
  ];

  const availableTags = [
    "Finance", "HR", "IT", "Marketing", "Sales", "Product", "Engineering",
    "Report", "Policy", "Analysis", "Strategy", "Documentation", "KPI",
    "Q1", "Q2", "Q3", "Q4", "2024", "Budget", "Training", "Compliance"
  ];

  useEffect(() => {
    // Simulate API call
    const fetchDocument = () => {
      console.log("Department - Fetching document with ID:", params.id);
      setLoading(true);
      
      // Find document by ID
      const foundDocument = mockDocuments.find(doc => doc.id === params.id);
      console.log("Department - Found document:", foundDocument);
      
      setTimeout(() => {
        setDocument(foundDocument || null);
        setLoading(false);
      }, 500);
    };

    if (params.id) {
      fetchDocument();
    }
  }, [params]);

  const handleEdit = () => {
    console.log("Department edit clicked, document:", document);
    if (document) {
      setEditModalVisible(true);
    }
  };

  const handleEditSave = async (values: any) => {
    console.log("Department edit document:", values);
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setDocument({
          ...document,
          ...values,
          updatedAt: new Date().toISOString()
        });
        setEditModalVisible(false);
        message.success("Document updated successfully");
        resolve();
      }, 1000);
    });
  };

  const handleDelete = () => {
    console.log("Department delete document:", params.id);
    // Delete logic would be implemented here
  };

  const handleDownload = () => {
    console.log("Department download document:", params.id);
    message.info("Download started...");
  };

  const handleShare = () => {
    console.log("Department share document:", params.id);
    message.info("Share dialog would open here");
  };

  return (
    <>
      <DocumentDetailPage
        document={document}
        loading={loading}
        userRole="department"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onShare={handleShare}
      />

      <EditDocumentModal
        open={editModalVisible}
        onCancel={() => {
          console.log("Department modal cancel clicked");
          setEditModalVisible(false);
        }}
        onSave={handleEditSave}
        document={document}
        departments={departments}
        availableTags={availableTags}
      />
    </>
  );
};

export default DepartmentDocumentDetail;