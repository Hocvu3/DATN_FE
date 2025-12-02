"use client";

import React, { useState } from "react";
import { Upload, message, Card, Button } from "antd";
import {
  LoadingOutlined,
  DeleteOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";

interface CoverImageUploadProps {
  value?: UploadFile | string;
  onChange?: (file: UploadFile | null) => void;
  disabled?: boolean;
  className?: string;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Handle file upload
  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;
    const uploadFile = file as File;
    
    try {
      setLoading(true);
      
      // Validate file type
      const isValidType = uploadFile.type?.startsWith("image/");
      if (!isValidType) {
        message.error("Only image files are allowed!");
        onError?.(new Error("Invalid file type"));
        return;
      }

      // Validate file size (max 5MB)
      const isValidSize = uploadFile.size < 5 * 1024 * 1024;
      if (!isValidSize) {
        message.error("Image must be smaller than 5MB!");
        onError?.(new Error("File too large"));
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(uploadFile);
      setPreviewUrl(url);

      // Create upload file object
      const uploadFileObj: UploadFile = {
        uid: Date.now().toString(),
        name: uploadFile.name,
        status: "done",
        originFileObj: uploadFile as any,
        url: url,
      };

      onChange?.(uploadFileObj);
      onSuccess?.("ok");
      message.success("Cover image uploaded successfully!");
    } catch (error) {
      message.error("Failed to upload image");
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Handle remove image
  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    onChange?.(null);
    message.success("Cover image removed");
  };

  // Get current image URL
  const getCurrentImageUrl = () => {
    if (previewUrl) return previewUrl;
    if (typeof value === "string") return value;
    if (value && value.url) return value.url;
    return null;
  };

  const currentImageUrl = getCurrentImageUrl();

  return (
    <div className={`cover-image-upload ${className}`}>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image
        </label>
        <p className="text-xs text-gray-500">
          Upload an image to use as the document cover. Recommended size: 800x600px (Max: 5MB)
        </p>
      </div>

      <Card
        className="border-2 border-dashed border-gray-200 hover:border-orange-400 transition-colors duration-200"
        bodyStyle={{ padding: 0 }}
      >
        {currentImageUrl ? (
          // Image preview
          <div className="relative group">
            <div className="aspect-video w-full relative overflow-hidden rounded-lg">
              <Image
                src={currentImageUrl}
                alt="Cover preview"
                fill
                className="object-cover"
                onError={() => {
                  setPreviewUrl("");
                  message.error("Failed to load image");
                }}
              />
            </div>
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  customRequest={handleUpload}
                  disabled={disabled || loading}
                >
                  <Button
                    type="primary"
                    icon={loading ? <LoadingOutlined /> : <CameraOutlined />}
                    size="small"
                    className="bg-orange-500 border-orange-500 hover:bg-orange-600"
                    disabled={disabled || loading}
                  >
                    Change
                  </Button>
                </Upload>
                
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleRemove}
                  disabled={disabled}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Upload area
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={handleUpload}
            disabled={disabled || loading}
            className="w-full"
          >
            <div className="aspect-video w-full flex flex-col items-center justify-center py-8 px-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
              <div className="text-center">
                {loading ? (
                  <>
                    <LoadingOutlined className="text-4xl text-orange-500 mb-4" />
                    <p className="text-gray-600">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                      <CameraOutlined className="text-2xl text-orange-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Upload Cover Image
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Click to browse or drag and drop an image
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                      <span>JPG</span>
                      <span>•</span>
                      <span>PNG</span>
                      <span>•</span>
                      <span>GIF</span>
                      <span>•</span>
                      <span>WebP</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Upload>
        )}
      </Card>

      {/* Additional tips */}
      <div className="mt-2 text-xs text-gray-500">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="ml-4 space-y-1">
          <li>• Use high-quality images for better visual appeal</li>
          <li>• Landscape orientation (16:9) works best</li>
          <li>• Avoid images with too much text</li>
        </ul>
      </div>
    </div>
  );
};

export default CoverImageUpload;