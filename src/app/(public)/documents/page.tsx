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
  message,
} from "antd";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import DocumentGallery from "@/components/documents/DocumentGallery";
import { DocumentsApi } from "@/lib/documents-api";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Interfaces - Updated to match API response
interface Document {
  id: string;
  title: string;
  description: string;
  documentNumber: string;
  status: string;
  securityLevel: string;
  isConfidential: boolean;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  department?: {
    id: string;
    name: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
  cover?: {
    id: string;
    s3Url: string;
    filename: string;
  };
  assets?: Array<{
    id: string;
    s3Url: string;
    filename: string;
    contentType: string;
    sizeBytes: string;
    isCover: boolean;
  }>;
}

interface FilterParams {
  keyword: string;
  sortBy: string;
  sortOrder: string;
  fileType: string;
  page: number;
  pageSize: number;
}

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
        console.log('Fetching public documents with filters:', filters);
        
        // Call the real API for public documents
        const response = await DocumentsApi.getPublicDocuments({
          page: filters.page,
          limit: filters.pageSize,
          search: filters.keyword || undefined,
          // Note: securityLevel is automatically set to PUBLIC by the backend endpoint
        });

        console.log('API response:', response);

        if (response.status === 200 && response.data) {
          // Handle the nested response structure
          const responseData = response.data as any;
          let rawDocuments = [];
          let totalCount = 0;
          
          if (responseData.documents) {
            // Direct structure: { documents: [], total: number, ... }
            rawDocuments = responseData.documents || [];
            totalCount = responseData.total || 0;
          } else if (responseData.data && responseData.data.documents) {
            // Nested structure: { data: { documents: [], total: number, ... } }
            rawDocuments = responseData.data.documents || [];
            totalCount = responseData.data.total || 0;
          } else {
            console.warn('Unexpected response structure:', responseData);
            rawDocuments = [];
            totalCount = 0;
          }

          // Use documents directly from API response - no transformation needed
          setDocuments(rawDocuments);
          setTotal(totalCount);
        } else {
          console.error('Failed to fetch documents:', response);
          setDocuments([]);
          setTotal(0);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching public documents:", error);
        setDocuments([]);
        setTotal(0);
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

  // Handle document download
  const handleDownload = async (doc: Document) => {
    try {
      // Find the document file (non-cover asset)
      const documentAssets = doc.assets || [];
      const documentFile = documentAssets.find((asset: any) => !asset.isCover);
      
      if (!documentFile || !documentFile.s3Url) {
        message.warning('No document file available for download');
        return;
      }

      // Extract keyPath from S3 URL
      const url = new URL(documentFile.s3Url);
      const keyPath = url.pathname.substring(1);
      
      console.log('Downloading file with keyPath:', keyPath);
      
      const blob = await DocumentsApi.downloadFilePublic(keyPath);
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = documentFile.filename || `${doc.title}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      message.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          message.error('File not found on server');
        } else if (error.message.includes('403')) {
          message.error('Access denied to file');
        } else if (error.message.includes('timeout')) {
          message.error('Download timeout - please try again');
        } else {
          message.error(`Download failed: ${error.message}`);
        }
      } else {
        message.error('Failed to download file');
      }
    }
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
            <DocumentGallery 
              documents={documents} 
              onDownload={handleDownload}
              isPublicView={true}
            />
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
