import React from 'react';
import { Modal, Button, Space, Typography } from 'antd';
import { CheckCircleOutlined, PictureOutlined, ThunderboltOutlined, CloseOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

export interface ApprovalOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSkip: () => void;
  onWatermarkOnly: () => void;
  onApplyAll: () => void;
  loading?: boolean;
}

export const ApprovalOptionsModal: React.FC<ApprovalOptionsModalProps> = ({
  visible,
  onClose,
  onSkip,
  onWatermarkOnly,
  onApplyAll,
  loading = false,
}) => {
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closeIcon={<CloseOutlined />}
      width={600}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          Approval Options
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Choose how you want to approve this document
        </Text>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Skip - No signature or watermark */}
          <Button
            block
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={onSkip}
            disabled={loading}
            style={{ 
              height: 'auto', 
              padding: '16px 24px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Skip</div>
              <div style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 'normal' }}>
                Approve without signature or watermark
              </div>
            </div>
          </Button>

          {/* Watermark Only */}
          <Button
            block
            size="large"
            icon={<PictureOutlined />}
            onClick={onWatermarkOnly}
            disabled={loading}
            style={{ 
              height: 'auto', 
              padding: '16px 24px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Watermark Only</div>
              <div style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 'normal' }}>
                Apply watermark without approval
              </div>
            </div>
          </Button>

          {/* Apply All - Watermark + Approve */}
          <Button
            block
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={onApplyAll}
            disabled={loading}
            style={{ 
              height: 'auto', 
              padding: '16px 24px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Apply All</div>
              <div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', fontWeight: 'normal' }}>
                Watermark + Approve (recommended)
              </div>
            </div>
          </Button>
        </Space>
      </div>
    </Modal>
  );
};
