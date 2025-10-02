"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Spin,
  Select,
  Radio,
  Card,
  Input,
  Empty,
  Pagination,
} from "antd";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import DocumentGallery from "@/components/documents/DocumentGallery";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Interfaces
interface Document {
  id: string;
  title: string;
  description: string;
  fileType: string;
  size: number;
  createdAt: string;
  tags: string[];
  downloads: number;
}

interface FilterParams {
  keyword: string;
  sortBy: string;
  sortOrder: string;
  fileType: string;
  page: number;
  pageSize: number;
}

// Mock data for initial development
const MOCK_DOCUMENTS: Document[] = [
  {
    id: "1",
    title: "Company Guidelines 2025",
    description: "Official guidelines for company policies and procedures.",
    fileType: "pdf",
    size: 2540000,
    createdAt: "2025-08-15T12:00:00Z",
    tags: ["guidelines", "policy", "public"],
    downloads: 153,
  },
  {
    id: "2",
    title: "Annual Financial Report Q3",
    description: "Quarterly financial performance and analysis.",
    fileType: "xlsx",
    size: 1240000,
    createdAt: "2025-07-22T09:30:00Z",
    tags: ["finance", "report", "quarterly"],
    downloads: 87,
  },
  {
    id: "3",
    title: "Product Roadmap 2025",
    description: "Strategic vision and development timeline for our products.",
    fileType: "pptx",
    size: 3800000,
    createdAt: "2025-07-05T14:15:00Z",
    tags: ["roadmap", "strategy", "product"],
    downloads: 121,
  },
  {
    id: "4",
    title: "Research Findings: Market Analysis",
    description:
      "Comprehensive market research analysis and competitor insights.",
    fileType: "pdf",
    size: 4200000,
    createdAt: "2025-06-18T10:45:00Z",
    tags: ["research", "market", "analysis"],
    downloads: 95,
  },
  {
    id: "5",
    title: "Legal Compliance Documentation",
    description:
      "Documentation for regulatory compliance and legal requirements.",
    fileType: "docx",
    size: 1850000,
    createdAt: "2025-05-30T16:20:00Z",
    tags: ["legal", "compliance", "regulation"],
    downloads: 63,
  },
  {
    id: "6",
    title: "Employee Handbook 2025",
    description: "Comprehensive guide for employee policies and benefits.",
    fileType: "pdf",
    size: 5100000,
    createdAt: "2025-05-12T11:10:00Z",
    tags: ["hr", "handbook", "policy"],
    downloads: 210,
  },
  {
    id: "7",
    title: "Marketing Campaign Results",
    description: "Analysis of recent marketing campaign performance and ROI.",
    fileType: "pptx",
    size: 2900000,
    createdAt: "2025-04-25T09:00:00Z",
    tags: ["marketing", "campaign", "analysis"],
    downloads: 76,
  },
  {
    id: "8",
    title: "Technical Documentation: API Reference",
    description: "Complete API reference guide for developers.",
    fileType: "pdf",
    size: 3400000,
    createdAt: "2025-04-10T15:30:00Z",
    tags: ["api", "technical", "reference"],
    downloads: 182,
  },
];

const FILE_TYPES = [
  { label: "PDF", value: "pdf" },
  { label: "Word Document", value: "docx" },
  { label: "Excel Spreadsheet", value: "xlsx" },
  { label: "PowerPoint", value: "pptx" },
];

const SORT_OPTIONS = [
  { label: "Date (Newest)", value: "date_desc" },
  { label: "Date (Oldest)", value: "date_asc" },
  { label: "Title (A-Z)", value: "title_asc" },
  { label: "Title (Z-A)", value: "title_desc" },
  { label: "Most Downloaded", value: "downloads_desc" },
];

// Helper functions are moved to DocumentGallery component

export default function PublicDocumentsPage() {
  // States
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
  const [filters, setFilters] = useState<FilterParams>({
    keyword: "",
    sortBy: "date_desc",
    sortOrder: "desc",
    fileType: "",
    page: 1,
    pageSize: 9,
  });

  // Fetch documents when filters change
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // In production, this would call the API with filter parameters
        // const response = await DocumentsApi.getPublicDocuments(filters);
        // setDocuments(response.data);
        // setTotal(response.total);

        // For development using mock data
        setTimeout(() => {
          let filteredDocs = [...MOCK_DOCUMENTS];

          // Apply keyword filter
          if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            filteredDocs = filteredDocs.filter(
              (doc) =>
                doc.title.toLowerCase().includes(keyword) ||
                doc.description.toLowerCase().includes(keyword) ||
                doc.tags.some((tag) => tag.toLowerCase().includes(keyword))
            );
          }

          // Apply file type filter
          if (filters.fileType) {
            filteredDocs = filteredDocs.filter(
              (doc) => doc.fileType === filters.fileType
            );
          }

          // Apply sorting
          const [sortField, sortOrder] = filters.sortBy.split("_");
          filteredDocs.sort((a, b) => {
            if (sortField === "date") {
              return sortOrder === "asc"
                ? new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                : new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime();
            } else if (sortField === "title") {
              return sortOrder === "asc"
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
            } else if (sortField === "downloads") {
              return sortOrder === "asc"
                ? a.downloads - b.downloads
                : b.downloads - a.downloads;
            }
            return 0;
          });

          setTotal(filteredDocs.length);

          // Apply pagination
          const startIdx = (filters.page - 1) * filters.pageSize;
          const endIdx = startIdx + filters.pageSize;
          filteredDocs = filteredDocs.slice(startIdx, endIdx);

          setDocuments(filteredDocs);
          setLoading(false);
        }, 600); // Simulate network delay
      } catch (error) {
        console.error("Error fetching documents:", error);
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [filters]);

  // Handle search input
  const handleSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      keyword: value,
      page: 1, // Reset to first page on new search
    }));
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value,
      page: 1,
    }));
  };

  // Handle file type filter change
  const handleFileTypeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      fileType: value,
      page: 1,
    }));
  };

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // List view columns configuration (not used in gallery view, but will be used if we add list view later)
  // We'll keep this for future implementation
  /*
  const columns = [
    // column configurations...
  ];
  */

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <Title level={2} className="!text-gray-800">
          Document Library
        </Title>
        <Paragraph className="text-gray-600">
          Browse our collection of public documents and resources. No login
          required to view or download.
        </Paragraph>
      </div>

      {/* Search and filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Text strong className="block mb-2">
              Search
            </Text>
            <Input
              placeholder="Search documents by title, description or tags..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={filters.keyword}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              className="w-full"
            />
          </div>

          <div className="w-full md:w-48">
            <Text strong className="block mb-2">
              File Type
            </Text>
            <Select
              placeholder="All Types"
              value={filters.fileType || undefined}
              onChange={handleFileTypeChange}
              className="w-full"
              allowClear
            >
              {FILE_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="w-full md:w-48">
            <Text strong className="block mb-2">
              Sort By
            </Text>
            <Select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="w-full"
            >
              {SORT_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="w-full md:w-auto flex justify-end">
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="gallery">
                <AppstoreOutlined />
              </Radio.Button>
              <Radio.Button value="list">
                <UnorderedListOutlined />
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </Card>

      {/* Document Gallery */}
      <div className="bg-white rounded-lg shadow p-6">
        <Spin spinning={loading}>
          {documents.length > 0 ? (
            <DocumentGallery documents={documents} />
          ) : (
            <Empty
              description="No documents found matching your criteria"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          {/* Pagination */}
          {total > 0 && (
            <div className="mt-8 flex justify-end">
              <Pagination
                current={filters.page}
                pageSize={filters.pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
                }
              />
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}
