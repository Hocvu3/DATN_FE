'use client';

import React from 'react';
import { Button } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useDocumentValidation } from '@/hooks/useDocumentValidation';

interface ValidateButtonProps {
  documentId: string;
  versionId: string;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
  onValidationComplete?: (isValid: boolean) => void;
}

export const ValidateButton: React.FC<ValidateButtonProps> = ({
  documentId,
  versionId,
  size = 'small',
  type = 'default',
  onValidationComplete,
}) => {
  const { validateVersion, validating, ValidationModal } = useDocumentValidation({
    onValidationComplete: (isValid) => {
      if (onValidationComplete) {
        onValidationComplete(isValid);
      }
    },
    showModalOnInvalid: true,
    allowProceedOnInvalid: false, // Just validate, don't auto proceed
  });

  const handleValidate = async () => {
    await validateVersion(documentId, versionId);
  };

  return (
    <>
      <Button
        size={size}
        type={type}
        icon={<SafetyCertificateOutlined />}
        loading={validating}
        onClick={handleValidate}
      >
        Validate
      </Button>
      <ValidationModal />
    </>
  );
};
