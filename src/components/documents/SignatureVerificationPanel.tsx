"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Spin,
  Alert,
  Descriptions,
  message,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { SignaturesApi, DigitalSignature } from "@/lib/signatures-api";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

interface SignatureVerificationPanelProps {
  documentId: string;
}

export const SignatureVerificationPanel: React.FC<
  SignatureVerificationPanelProps
> = ({ documentId }) => {
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    loadSignatures();
  }, [documentId]);

  const loadSignatures = async () => {
    try {
      setLoading(true);
      const result = await SignaturesApi.getDocumentSignatures(documentId);
      const data = result.data?.data || result.data || [];
      setSignatures(data);
    } catch (error) {
      console.error("Failed to load signatures:", error);
      message.error("Failed to load signatures");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (signatureId: string) => {
    try {
      setVerifying(signatureId);
      const result = await SignaturesApi.verifySignature(signatureId);
      const verification = result.data?.data || result.data;

      if (verification.isValid) {
        message.success(verification.message);
      } else {
        message.error(verification.message);
      }

      // Reload signatures to get updated status
      await loadSignatures();
    } catch (error) {
      console.error("Verification failed:", error);
      message.error("Failed to verify signature");
    } finally {
      setVerifying(null);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "VALID":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "INVALID":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <WarningOutlined style={{ color: "#faad14" }} />;
    }
  };

  const getStatusTag = (status?: string) => {
    switch (status) {
      case "VALID":
        return <Tag color="success">Valid</Tag>;
      case "INVALID":
        return <Tag color="error">Invalid</Tag>;
      case "PENDING":
        return <Tag color="processing">Pending</Tag>;
      default:
        return <Tag color="warning">Unknown</Tag>;
    }
  };

  if (loading) {
    return (
      <Card title={<><SafetyOutlined /> Digital Signatures</>}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (signatures.length === 0) {
    return (
      <Card title={<><SafetyOutlined /> Digital Signatures</>}>
        <Alert
          message="No digital signatures"
          description="This document has not been digitally signed yet."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card 
      title={<><SafetyOutlined /> Digital Signatures</>}
      extra={
        <Text type="secondary">
          {signatures.length} signature{signatures.length !== 1 ? "s" : ""}
        </Text>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {signatures.map((sig) => (
          <Card
            key={sig.id}
            type="inner"
            title={
              <Space>
                {getStatusIcon(sig.signatureStatus)}
                <span>
                  Signed by {sig.signer?.firstName} {sig.signer?.lastName}
                </span>
                {getStatusTag(sig.signatureStatus)}
              </Space>
            }
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => handleVerify(sig.id)}
                loading={verifying === sig.id}
                size="small"
              >
                Verify
              </Button>
            }
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Signed At">
                {dayjs(sig.signedAt).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
              
              <Descriptions.Item label="Signer Email">
                {sig.signer?.email}
              </Descriptions.Item>

              {sig.signatureStamp && (
                <Descriptions.Item label="Signature Stamp" span={2}>
                  <Space>
                    <img
                      src={sig.signatureStamp.imageUrl}
                      alt={sig.signatureStamp.name}
                      style={{
                        maxHeight: 40,
                        maxWidth: 100,
                        objectFit: "contain",
                      }}
                    />
                    <Text>{sig.signatureStamp.name}</Text>
                  </Space>
                </Descriptions.Item>
              )}

              {sig.documentHash && (
                <Descriptions.Item label="Document Hash" span={2}>
                  <Tooltip title={sig.documentHash}>
                    <Text code style={{ fontSize: 12 }}>
                      {sig.documentHash.substring(0, 32)}...
                    </Text>
                  </Tooltip>
                </Descriptions.Item>
              )}

              {sig.verifiedAt && (
                <Descriptions.Item label="Last Verified" span={2}>
                  {dayjs(sig.verifiedAt).format("YYYY-MM-DD HH:mm:ss")}
                </Descriptions.Item>
              )}
            </Descriptions>

            {sig.signatureStatus === "VALID" && (
              <Alert
                message="Signature Verified"
                description="This signature is valid and the document has not been modified since signing."
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}

            {sig.signatureStatus === "INVALID" && (
              <Alert
                message="Signature Invalid"
                description="Warning: This document may have been modified after signing, or the signature is corrupted."
                type="error"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        ))}
      </Space>
    </Card>
  );
};

export default SignatureVerificationPanel;
