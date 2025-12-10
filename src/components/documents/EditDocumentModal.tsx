"use client";

import React, { useEffect, useState, useRef } from "react";
import { Modal, Form, Input, Select, Button, message, Tooltip } from "antd";
import { CameraOutlined, LoadingOutlined, UploadOutlined, DownloadOutlined, EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import { DepartmentsApi } from "@/lib/departments-api";
import { TagsApi, Tag } from "@/lib/tags-api";
import { uploadDocumentCover, uploadDocumentFile, DocumentsApi } from "@/lib/documents-api";
import { Department, DocumentStatus, SecurityLevel, Asset } from "@/lib/types/document.types";
import Image from "next/image";

const { Option } = Select;
const { TextArea } = Input;

interface DocumentForEdit {
  id: string;
  title: string;
  description?: string;
  fileType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  status: DocumentStatus;
  securityLevel: SecurityLevel;
  department: string;
  departmentId?: string;
  cover?: {
    id: string;
    s3Url: string;
  };
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface EditDocumentModalProps {
  open: boolean;
  document: DocumentForEdit | null;
  onCancel: () => void;
  onSave: (values: any) => Promise<void>;
  onCoverUpdate?: (newCoverUrl: string) => void;
}

const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  open,
  document,
  onCancel,
  onSave,
  onCoverUpdate,
}) => {
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

    const fetchDocumentAssets = async () => {
      if (open && document) {
        try {
          const { data } = await DocumentsApi.getDocumentAssets(document.id);
          if (data && data.assets) {
            // Filter out cover images to show only document files
            const documentFiles = data.assets.filter(asset => !asset.isCover);
            setDocumentAssets(documentFiles);
          }
        } catch (error) {
          // Don't show error message as it's not critical
        }
      }
    };

    fetchDepartments();
    fetchTags();
    fetchDocumentAssets();
  }, [open, document]);

  // Initialize form with document data when modal opens
  useEffect(() => {
    if (open && document) {
      setCurrentCover(document.cover?.s3Url || null);
      form.setFieldsValue({
        title: document.title,
        description: document.description,
        departmentId: document.departmentId || document.department, // Use departmentId if available, fallback to department
        tags: document.tags, // These should be tag IDs
        status: document.versions?.find(v => v.isLatest)?.status || DocumentStatus.DRAFT,
        securityLevel: document.securityLevel,
      });
    } else {
      form.resetFields();
      setCurrentCover(null);
    }
  }, [open, document, form]);

  // Handle cover image upload
  const handleCoverUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !document) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('File size must be less than 5MB');
      return;
    }

    setUploadingCover(true);
    try {
      const newCoverUrl = await uploadDocumentCover(document.id, file);
      setCurrentCover(newCoverUrl);
      message.success('Cover image updated successfully');
      onCoverUpdate?.(newCoverUrl);
    } catch (error) {
      message.error('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      
      // Convert values to match API structure
      const updateData = {
        // id: document?.id,
        title: values.title,
        description: values.description,
        status: values.status,
        securityLevel: values.securityLevel,
        departmentId: values.departmentId,
        isConfidential: values.securityLevel === SecurityLevel.CONFIDENTIAL || 
                        values.securityLevel === SecurityLevel.SECRET || 
                        values.securityLevel === SecurityLevel.TOP_SECRET,
        tags: values.tags || [],
      };
      
      await onSave(updateData);
      form.resetFields();
    } catch (error) {
      message.error("Failed to update document");
    } finally {
      setLoading(false);
    }
  };

  // Handle document file upload
  const handleDocumentFileUpload = () => {
    documentFileInputRef.current?.click();
  };

  const handleDocumentFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !document) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      message.error('Please select a valid document file (PDF, DOC, DOCX, TXT, RTF)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      message.error('File size must be less than 50MB');
      return;
    }

    setUploadingFile(true);
    try {
      await uploadDocumentFile(document.id, file);
      message.success('Document file uploaded successfully');
      
      // Refresh document assets
      try {
        const { data } = await DocumentsApi.getDocumentAssets(document.id);
        if (data && data.assets) {
          const documentFiles = data.assets.filter(asset => !asset.isCover);
          setDocumentAssets(documentFiles);
        }
      } catch (assetError) {
      }
    } catch (error) {
      message.error('Failed to upload document file');
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

  // Handle file download
  const handleDownloadFile = async (s3Url: string, filename: string) => {
    try {
      // Extract S3 key from URL
      const urlParts = s3Url.split('/');
      const keyPath = urlParts.slice(-2).join('/'); // Gets "folder/filename.ext"
      
      const blob = await DocumentsApi.downloadFile(keyPath);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = filename;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('File downloaded successfully');
    } catch (error) {
      message.error('Failed to download file');
    }
  };

  // Handle file view
  const handleViewFile = (s3Url: string) => {
    try {
      // Extract S3 key from URL
      const urlParts = s3Url.split('/');
      const keyPath = urlParts.slice(-2).join('/');
      
      const viewUrl = DocumentsApi.getFileViewUrl(keyPath);
      window.open(viewUrl, '_blank');
    } catch (error) {
      message.error('Failed to view file');
    }
  };


  return (
    <Modal
      title={`Edit Document: ${document?.title || ''}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      style={{ zIndex: 1050 }}
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {/* Document Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Form.Item
              name="title"
              label="Document Title"
              rules={[{ required: true, message: "Please enter document title" }]}
            >
              <Input placeholder="Enter document title" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea
                rows={4}
                placeholder="Enter document description"
              />
            </Form.Item>

            <Form.Item
              name="departmentId"
              label="Department"
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select 
                placeholder="Select department"
                loading={loadingDepartments}
              >
                {departments.map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status">
                {Object.values(DocumentStatus).map((status) => (
                  <Option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="space-y-4">
            <Form.Item name="tags" label="Tags">
              <Select
                mode="multiple"
                placeholder="Select tags"
                allowClear
                style={{ width: "100%" }}
                maxTagCount="responsive"
                loading={loadingTags}
              >
                {tags.map((tag) => (
                  <Option key={tag.id} value={tag.id}>
                    <div className="flex items-center">
                      {tag.color && (
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: tag.color }}
                        ></span>
                      )}
                      {tag.name}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="securityLevel"
              label="Security Level"
              rules={[{ required: true, message: "Please select security level" }]}
            >
              <Select placeholder="Select security level">
                {Object.values(SecurityLevel).map((level) => {
                  let color;
                  switch(level) {
                    case SecurityLevel.PUBLIC:
                      color = 'bg-green-500';
                      break;
                    case SecurityLevel.INTERNAL:
                      color = 'bg-blue-500';
                      break;
                    case SecurityLevel.CONFIDENTIAL:
                      color = 'bg-yellow-500';
                      break;
                    case SecurityLevel.SECRET:
                      color = 'bg-orange-500';
                      break;
                    case SecurityLevel.TOP_SECRET:
                      color = 'bg-red-500';
                      break;
                    default:
                      color = 'bg-gray-500';
                  }
                  
                  return (
                    <Option key={level} value={level}>
                      <span className="flex items-center">
                        <span className={`w-2 h-2 ${color} rounded-full mr-2`}></span>
                        {level.replace('_', ' ')}
                      </span>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            {/* Cover image display with upload functionality */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cover Image
              </label>
              <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 group">
                {currentCover ? (
                  <Image
                    src={currentCover}
                    alt="Document cover"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <CameraOutlined className="text-3xl text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">No Cover Image</p>
                    </div>
                  </div>
                )}
                
                {/* Upload overlay button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <Tooltip title={uploadingCover ? 'Uploading...' : 'Click to Upload Cover Image'}>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={uploadingCover ? <LoadingOutlined spin /> : <CameraOutlined />}
                      onClick={handleCoverUpload}
                      loading={uploadingCover}
                      className="bg-blue-500/90 border-blue-500 hover:bg-blue-600 shadow-xl backdrop-blur-sm transform transition-all duration-200 hover:scale-110"
                      size="large"
                      style={{
                        width: '50px',
                        height: '50px',
                        fontSize: '20px',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                      }}
                    />
                  </Tooltip>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500">
                Click the camera icon to upload a new cover image (Max 5MB, PNG/JPG)
              </p>
            </div>

            {/* Document Files Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Document Files
              </label>
              
              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <Button
                  type="dashed"
                  icon={<UploadOutlined />}
                  onClick={handleDocumentFileUpload}
                  loading={uploadingFile}
                  className="border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:text-blue-700"
                >
                  {uploadingFile ? 'Uploading...' : 'Upload Document File'}
                </Button>
                <span className="text-xs text-gray-500">
                  Supported: PDF, DOC, DOCX, TXT (Max 50MB)
                </span>
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
                        <div className="flex items-center space-x-2">
                          <Tooltip title="View File">
                            <Button
                              type="text"
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => handleViewFile(asset.s3Url)}
                              className="text-blue-600 hover:text-blue-700"
                            />
                          </Tooltip>
                          <Tooltip title="Download File">
                            <Button
                              type="text"
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownloadFile(asset.s3Url, asset.filename)}
                              className="text-green-600 hover:text-green-700"
                            />
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden file input for documents */}
              <input
                ref={documentFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf"
                onChange={handleDocumentFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="bg-orange-500 border-orange-500 hover:bg-orange-600"
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditDocumentModal;