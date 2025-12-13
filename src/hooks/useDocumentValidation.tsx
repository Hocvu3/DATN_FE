"use client";

import { useState } from "react";
import { Modal, message, Alert, Space, Typography, Button } from "antd";
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { VersionApi } from "@/lib/version-api";
import { DocumentVersion } from "@/lib/types/document.types";

const { Text, Title } = Typography;

interface ValidationResult {
  isValid: boolean;
  version: {
    id: string;
    versionNumber: number;
    status: string;
    fileSize: number;
    s3Key: string | null;
    s3Url: string | null;
    mimeType: string;
    createdAt: string;
  };
  validation: {
    fileExists: boolean;
    checksumMatch: boolean;
    actualChecksum: string | null;
    signatureCount: number;
    hasSignatures: boolean;
    signatureVerifications?: Array<{
      signatureId: string;
      signerName: string;
      isValid: boolean;
      status: string;
    }>;
  };
  issues: string[];
  message: string;
}

interface UseDocumentValidationOptions {
  onValidationComplete?: (isValid: boolean, result: ValidationResult) => void;
  showModalOnInvalid?: boolean;
  allowProceedOnInvalid?: boolean;
  showModalOnValid?: boolean; // NEW: Show modal even when validation passes
}

export const useDocumentValidation = (options?: UseDocumentValidationOptions) => {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [documentId, setDocumentId] = useState<string>('');
  const [versionId, setVersionId] = useState<string>('');

  const validateVersion = async (
    docId: string,
    verId: string,
    onProceed?: () => void | Promise<void>
  ): Promise<boolean> => {
    setValidating(true);
    setDocumentId(docId);
    setVersionId(verId);
    
    try {
      const response = await VersionApi.validateVersion(docId, verId);
      
      // Extract the actual validation data from response
      const result = (response as any).data?.data || (response as any).data || response;
      
      setValidationResult(result);

      // Call completion callback if provided
      if (options?.onValidationComplete) {
        options.onValidationComplete(result.isValid, result);
      }

      // Always show modal with validation results
      setValidationModalVisible(true);
      
      // Store proceed callback for modal
      if (onProceed) {
        (window as any).__validationProceedCallback = onProceed;
      }

      return result.isValid;
    } catch (error) {
      message.error("Failed to validate document: " + (error instanceof Error ? error.message : "Unknown error"));
      
      // On error, still allow proceed if callback provided
      if (onProceed && options?.allowProceedOnInvalid !== false) {
        Modal.confirm({
          title: 'Validation Error',
          content: 'Failed to validate document. Do you want to proceed anyway?',
          okText: 'Proceed',
          cancelText: 'Cancel',
          onOk: async () => {
            await onProceed();
          },
        });
      }
      
      return false;
    } finally {
      setValidating(false);
    }
  };

  // NEW: Manual validation that always shows modal with results
  const validateVersionWithModal = async (
    docId: string,
    verId: string,
  ): Promise<void> => {
    setValidating(true);
    setDocumentId(docId);
    setVersionId(verId);
    
    try {
      const response = await VersionApi.validateVersion(docId, verId);
      // Extract the actual validation data from response
      const result = (response as any).data?.data || (response as any).data || response;
      
      setValidationResult(result);
      setValidationModalVisible(true); // Always show modal
      
      // Call completion callback if provided
      if (options?.onValidationComplete) {
        options.onValidationComplete(result.isValid, result);
      }
    } catch (error) {
      message.error("Failed to validate document: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setValidating(false);
    }
  };

  const handleModalProceed = async () => {
    setValidationModalVisible(false);
    
    const callback = (window as any).__validationProceedCallback;
    if (callback) {
      await callback();
      delete (window as any).__validationProceedCallback;
    }
  };

  const handleModalCancel = () => {
    setValidationModalVisible(false);
    delete (window as any).__validationProceedCallback;
  };

  const ValidationModal = () => {
    if (!validationResult) return null;
    
    const isValid = validationResult.isValid;
    
    return (
      <Modal
        title={
          <Space>
            {isValid ? (
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
            ) : (
              <WarningOutlined style={{ color: '#faad14', fontSize: 24 }} />
            )}
            <Title level={4} style={{ margin: 0 }}>
              {isValid ? 'Document Validation Success' : 'Document Validation Warning'}
            </Title>
          </Space>
        }
        open={validationModalVisible}
        onOk={handleModalProceed}
        onCancel={handleModalCancel}
        width={600}
        footer={
          isValid ? [
            // For valid documents, show proceed button
            <Button key="proceed" type="primary" onClick={handleModalProceed}>
              Proceed
            </Button>,
          ] : [
            // For invalid documents, show proceed anyway/cancel
            <Button key="cancel" onClick={handleModalCancel}>
              Cancel
            </Button>,
            <Button
              key="proceed"
              type="primary"
              danger
              onClick={handleModalProceed}
            >
              Proceed Anyway
            </Button>,
          ]
        }
      >
      {validationResult && (
        <div>
          <Alert
            message={validationResult.message || (isValid ? "Document is Valid" : "Validation Warning")}
            description={
              <div>
                {!isValid ? (
                  <>
                    {(validationResult.issues || []).length > 0 && (
                      <>
                        <p className="mb-3">The following issues were detected:</p>
                        <ul className="mt-2 mb-2 space-y-1">
                          {(validationResult.issues || []).map((issue, index) => (
                            <li key={index} className="text-red-600 flex items-start">
                              <CloseCircleOutlined className="mr-2 mt-1 flex-shrink-0" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <p className="mt-4 text-gray-600">
                      <strong>Note:</strong> You can still proceed to view or download this document.
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    {validationResult.validation?.hasSignatures && (
                      <p className="text-green-600 flex items-center">
                        <CheckCircleOutlined className="mr-2" />
                        All digital signatures are valid ({validationResult.validation?.signatureCount || 0} signature{(validationResult.validation?.signatureCount || 0) > 1 ? 's' : ''})
                      </p>
                    )}
                  </div>
                )}
              </div>
            }
            type={isValid ? "success" : "warning"}
            showIcon
            className="mb-4"
          />
        </div>
      )}
      </Modal>
    );
  };

  return {
    validateVersion,
    validateVersionWithModal, // NEW: Always shows modal with results
    validating,
    validationResult,
    ValidationModal,
    isValid: validationResult?.isValid ?? null,
  };
};
