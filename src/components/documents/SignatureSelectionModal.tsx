"use client";

import React from "react";
import { Modal, Row, Col, Card, Empty, Spin, Typography, Image, Button, Space } from "antd";
import { CheckCircleOutlined, PlusOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface SignatureStamp {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  isActive: boolean;
}

interface SignatureSelectionModalProps {
  visible: boolean;
  signatures: SignatureStamp[];
  loading: boolean;
  approving?: boolean;
  selectedSignatureId?: string;
  onSelect: (signatureId: string) => void;
  onApprove: () => void;
  onCreateNew?: () => void;
  onCancel: () => void;
}

export const SignatureSelectionModal: React.FC<
  SignatureSelectionModalProps
> = ({ 
  visible, 
  signatures, 
  loading, 
  approving = false,
  selectedSignatureId, 
  onSelect, 
  onApprove,
  onCreateNew,
  onCancel 
}) => {
  console.log('[SignatureSelectionModal] Render:', { visible, signaturesCount: signatures.length, loading, selectedSignatureId });
  
  return (
    <Modal
      title="Select Watermark to Approve Document"
      open={visible}
      onCancel={onCancel}
      closeIcon={<CloseOutlined />}
      footer={null}
      width={800}
      centered
    >
      <div style={{ marginTop: 16 }}>
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Choose a watermark to apply to this document
        </Text>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : signatures.length === 0 ? (
          <Empty
            description="No active watermarks available"
            style={{ padding: "40px 0" }}
          >
            {onCreateNew && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={onCreateNew}
              >
                Create New Watermark
              </Button>
            )}
          </Empty>
        ) : (
          <>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {signatures.map((signature) => (
                <Col key={signature.id} xs={24} sm={12} md={8}>
                  <Card
                    hoverable
                    onClick={() => onSelect(signature.id)}
                    style={{
                      borderColor:
                        selectedSignatureId === signature.id
                          ? "#1890ff"
                          : undefined,
                      borderWidth: selectedSignatureId === signature.id ? 2 : 1,
                      position: "relative",
                    }}
                    bodyStyle={{
                      padding: 16,
                      textAlign: "center",
                    }}
                  >
                    {selectedSignatureId === signature.id && (
                      <CheckCircleOutlined
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          fontSize: 20,
                          color: "#1890ff",
                        }}
                      />
                    )}
                    <div
                      style={{
                        height: 120,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                        background: "#f5f5f5",
                        borderRadius: 4,
                      }}
                    >
                      <Image
                        src={signature.imageUrl}
                        alt={signature.name}
                        preview={false}
                        style={{
                          maxHeight: "100%",
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <Text strong style={{ display: "block", marginBottom: 4 }}>
                      {signature.name}
                    </Text>
                    {signature.description && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {signature.description}
                      </Text>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Approve button below grid */}
            <div style={{ 
              borderTop: "1px solid #f0f0f0", 
              paddingTop: 16,
              display: "flex",
              justifyContent: "flex-end",
              gap: 8
            }}>
              <Space>
                <Button onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={onApprove}
                  disabled={!selectedSignatureId}
                  loading={approving}
                >
                  Approve with Watermark
                </Button>
              </Space>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
