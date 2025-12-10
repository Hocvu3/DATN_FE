"use client";

import React, { useState } from "react";
import { message } from "antd";
import { SignatureSelectionModal, SignatureStamp } from "@/components/documents/SignatureSelectionModal";
import { SignaturesApi } from "@/lib/signatures-api";
import { DocumentsApi } from "@/lib/documents-api";
import { VersionApi } from "@/lib/version-api";
import { DocumentStatus } from "@/lib/types/document.types";

interface UseDocumentApprovalOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useDocumentApproval = (options?: UseDocumentApprovalOptions) => {
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>();
  const [signatures, setSignatures] = useState<SignatureStamp[]>([]);
  const [loadingSignatures, setLoadingSignatures] = useState(false);
  const [approving, setApproving] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string>();

  const loadActiveSignatures = async () => {
    try {
      setLoadingSignatures(true);
      const result = await SignaturesApi.getActive();
      console.log('[useDocumentApproval] API result:', result);
      
      // Handle wrapped response: { data: { success, message, data: [...] } }
      const responseData = result.data as any;
      const signaturesData = responseData?.data || responseData || [];
      console.log('[useDocumentApproval] Extracted signatures:', signaturesData);
      
      setSignatures(Array.isArray(signaturesData) ? signaturesData : []);
    } catch (error) {
      console.error("Failed to load signature stamps:", error);
      message.error("Failed to load signature stamps");
      setSignatures([]);
    } finally {
      setLoadingSignatures(false);
    }
  };

  const showApprovalFlow = async (documentId: string) => {
    console.log('[useDocumentApproval] showApprovalFlow called with documentId:', documentId);
    setCurrentDocumentId(documentId);
    setSelectedSignatureId(undefined);
    setSignatureModalVisible(true); // Show modal immediately, then load data
    await loadActiveSignatures();
  };

  const handleSelectSignature = (signatureId: string) => {
    setSelectedSignatureId(signatureId);
  };

  const handleCancelSignatureSelection = () => {
    setSignatureModalVisible(false);
    setSelectedSignatureId(undefined);
  };

  const handleApproveWithSignature = async () => {
    if (!selectedSignatureId || !currentDocumentId) {
      message.warning("Please select a signature stamp");
      return;
    }

    try {
      setApproving(true);

      // Apply the signature stamp
      await SignaturesApi.applySignature({
        documentId: currentDocumentId,
        signatureStampId: selectedSignatureId,
        reason: "Document approved",
      });

      // Get latest version and update its status to APPROVED
      const docResponse = await DocumentsApi.getById(currentDocumentId);
      const document = docResponse.data?.data?.document || docResponse.data;
      const latestVersion = document?.versions?.find((v: any) => v.isLatest);
      
      if (latestVersion) {
        await VersionApi.updateVersionStatus(
          currentDocumentId, 
          latestVersion.id, 
          DocumentStatus.APPROVED
        );
      }

      message.success("Document approved successfully with signature");
      setSignatureModalVisible(false);
      setSelectedSignatureId(undefined);
      setCurrentDocumentId(undefined);

      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (error: any) {
      console.error("Failed to approve document:", error);
      message.error(error.message || "Failed to approve document");
      
      if (options?.onError) {
        options.onError(error);
      }
    } finally {
      setApproving(false);
    }
  };

  return {
    showApprovalFlow,
    approving,
    signatureModalVisible,
    signatures,
    loadingSignatures,
    selectedSignatureId,
    handleSelectSignature,
    handleApproveWithSignature,
    handleCancelSignatureSelection,
  };
};
