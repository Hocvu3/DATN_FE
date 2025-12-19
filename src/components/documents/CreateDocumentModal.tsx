'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { UploadOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { DocumentsApi, uploadDocumentCover, uploadDocumentFile } from '@/lib/documents-api';
import { DepartmentsApi } from '@/lib/departments-api';
import { TagsApi } from '@/lib/tags-api';
import { DocumentStatus, SecurityLevel } from '@/lib/types/document.types';

interface Department {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface Asset {
  id: string;
  filename: string;
  s3Url: string;
  contentType: string;
  sizeBytes: string;
  isCover: boolean;
}

interface CreateDocumentModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (document: any) => void;
}

const { TextArea } = Input;
const { Option } = Select;

export default function CreateDocumentModal({
  open,
  onCancel,
  onSave,
}: CreateDocumentModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [currentCover, setCurrentCover] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [documentAssets, setDocumentAssets] = useState<Asset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch departments and tags when modal opens
  useEffect(() => {
    const fetchDepartments = async () => {
      if (open) {
        setLoadingDepartments(true);
        try {
          const { data } = await DepartmentsApi.getAll();
          if (data && data.data && data.data.departments) {
            setDepartments(data.data.departments);
          }
        } catch (error) {
          message.error('Failed to load departments');
        } finally {
          setLoadingDepartments(false);
        }
      }
    };

    const fetchTags = async () => {
      if (open) {
        setLoadingTags(true);
        try {
          const { data } = await TagsApi.getAll();
          if (data && data.data && data.data.tags) {
            setTags(data.data.tags);
          }
        } catch (error) {
          message.error('Failed to load tags');
        } finally {
          setLoadingTags(false);
        }
      }
    };

    fetchDepartments();
    fetchTags();
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setCurrentCover(null);
      setDocumentAssets([]);
    }
  }, [open, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Step 1: Create the document
      const response = await DocumentsApi.createDocument(values);
      
      // Handle nested response structure: { success, data: { message, document } }
      const responseData = response.data as any;
      const documentData = responseData.data || responseData;
      const createdDocument = documentData.document || documentData;
      
      if (createdDocument && createdDocument.id) {
        const documentId = createdDocument.id;
        
        // Step 2: Upload cover image if selected
        const tempCoverFile = (window as any).tempCoverFile;
        if (tempCoverFile) {
          try {
            await uploadDocumentCover(documentId, tempCoverFile);
            message.success('Document and cover created successfully');
          } catch (coverError) {
            message.warning('Document created but cover upload failed');
          }
        }
        
        // Step 3: Upload document files if selected
        for (const asset of documentAssets) {
          const tempFile = (asset as any).tempFile;
          if (tempFile) {
            try {
              await uploadDocumentFile(documentId, tempFile);
              message.success('Document and file created successfully');
            } catch (fileError) {
              message.warning(`Document created but file "${asset.filename}" upload failed`);
            }
          }
        }
        
        // Only show generic success if no files were uploaded
        if (!tempCoverFile && documentAssets.length === 0) {
          message.success('Document created successfully');
        }
        
        handleCancel(); // Close modal first
        onSave(createdDocument); // Then trigger parent refresh
      } else {
        message.error('Failed to create document');
      }
    } catch (error) {
      console.error('Create document error:', error);
      message.error('Error creating document');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentCover(null);
    setDocumentAssets([]);
    
    // Cleanup temp files
    if ((window as any).tempCoverFile) {
      delete (window as any).tempCoverFile;
    }
    
    onCancel();
  };

  // Handle cover image upload
  const handleCoverUpload = async (file: File) => {
    if (!file) return;

    try {
      setUploadingCover(true);
      
      // Store the file temporarily, we'll upload it after document creation
      setCurrentCover(URL.createObjectURL(file));
      // Store the actual file for later upload
      (window as any).tempCoverFile = file;
      
      message.success('Cover image selected');
    } catch (error) {
      message.error('Failed to select cover image');
    } finally {
      setUploadingCover(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle document file upload
  const handleDocumentFileUpload = async (file: File) => {
    if (!file) return;

    try {
      setUploadingFile(true);
      
      // Store the file temporarily, we'll upload it after document creation
      const newAsset: Asset = {
        id: `temp-${Date.now()}`,
        filename: file.name,
        s3Url: URL.createObjectURL(file),
        contentType: file.type,
        sizeBytes: file.size.toString(),
        isCover: false,
      };
      
      // Store the actual file for later upload
      (newAsset as any).tempFile = file;
      
      setDocumentAssets(prev => [...prev, newAsset]);
      message.success('Document file selected');
    } catch (error) {
      message.error('Failed to select document file');
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (documentFileInputRef.current) {
        documentFileInputRef.current.value = '';
      }
    }
  };

  // File utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      title="Create New Document"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: DocumentStatus.DRAFT,
          securityLevel: SecurityLevel.PUBLIC,
          isConfidential: false,
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input document title!' }]}
          >
            <Input placeholder="Enter document title" />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="Department"
            rules={[{ required: true, message: 'Please select department!' }]}
          >
            <Select
              placeholder="Select department"
              loading={loadingDepartments}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
              }
            >
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Enter document description" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select placeholder="Select status">
              <Option value={DocumentStatus.DRAFT}>Draft</Option>
              <Option value={DocumentStatus.PENDING_APPROVAL}>Pending Approval</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="securityLevel"
            label="Security Level"
            rules={[{ required: true, message: 'Please select security level!' }]}
          >
            <Select placeholder="Select security level">
              <Option value={SecurityLevel.PUBLIC}>Public</Option>
              <Option value={SecurityLevel.INTERNAL}>Internal</Option>
              <Option value={SecurityLevel.CONFIDENTIAL}>Confidential</Option>
              <Option value={SecurityLevel.SECRET}>Secret</Option>
              <Option value={SecurityLevel.TOP_SECRET}>Top Secret</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item name="tags" label="Tags">
          <Select
            mode="multiple"
            placeholder="Select tags"
            loading={loadingTags}
            showSearch
            filterOption={(input, option) =>
              option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
            }
          >
            {tags.map((tag) => (
              <Option key={tag.id} value={tag.id}>
                {tag.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Cover Image Upload */}
        <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Cover Image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleCoverUpload(file);
                }
              }}
            />
            <Button
              icon={<UploadOutlined />}
              onClick={() => fileInputRef.current?.click()}
              loading={uploadingCover}
              size="small"
            >
              Upload Cover
            </Button>
          </div>
          
          {currentCover ? (
            <div className="bg-gray-50 rounded-md p-3 border border-gray-200 relative h-32">
              <Image
                src={currentCover}
                alt="Cover preview"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <PlusOutlined className="text-2xl mb-2" />
              <div>No cover image uploaded</div>
            </div>
          )}
        </div>

        {/* Document File Upload */}
        <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Document Files</span>
            <input
              ref={documentFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleDocumentFileUpload(file);
                }
              }}
            />
            <Button
              icon={<UploadOutlined />}
              onClick={() => documentFileInputRef.current?.click()}
              loading={uploadingFile}
              size="small"
            >
              Upload File
            </Button>
          </div>

          {/* Document Assets List */}
          {documentAssets && documentAssets.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Document Assets</h4>
              <div className="space-y-2">
                {documentAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between bg-white rounded-md p-3 border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <FileTextOutlined className="text-blue-500 text-lg" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {asset.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {asset.contentType} • {formatFileSize(Number(asset.sizeBytes) || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!documentAssets || documentAssets.length === 0) && (
            <div className="text-center py-4 text-gray-500">
              <FileTextOutlined className="text-2xl mb-2" />
              <div>No document files uploaded</div>
              <div className="text-xs">Supported formats: PDF, DOC, DOCX, TXT</div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Document
          </Button>
        </div>
      </Form>
    </Modal>
  );
}