'use client';

import React, { useState } from 'react';
import { Timeline, Badge, Button, Space, Tag, Tooltip, Dropdown, Menu, message, Switch } from 'antd';
import {
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  SwapOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { DocumentVersion, DocumentStatus } from '@/lib/types/document.types';
import { VersionApi } from '@/lib/version-api';
import { useDocumentValidation } from '@/hooks/useDocumentValidation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface VersionTimelineProps {
  versions: DocumentVersion[];
  documentId: string;
  onViewVersion?: (version: DocumentVersion) => void;
  onDownloadVersion?: (version: DocumentVersion) => void;
  onEditVersion?: (version?: DocumentVersion) => void;
  onDeleteVersion?: (version: DocumentVersion) => void;
  onCompareVersions?: (v1: DocumentVersion, v2: DocumentVersion) => void;
  onApproveVersion?: (version: DocumentVersion) => void;
  onRejectVersion?: (version: DocumentVersion) => void;
}

const statusConfig = {
  [DocumentStatus.DRAFT]: {
    color: 'default',
    icon: <EditOutlined />,
    label: 'Draft',
    badgeStatus: 'default' as const,
  },
  [DocumentStatus.PENDING_APPROVAL]: {
    color: 'processing',
    icon: <SyncOutlined spin />,
    label: 'Pending Approval',
    badgeStatus: 'processing' as const,
  },
  [DocumentStatus.APPROVED]: {
    color: 'success',
    icon: <CheckCircleOutlined />,
    label: 'Approved',
    badgeStatus: 'success' as const,
  },
  [DocumentStatus.REJECTED]: {
    color: 'error',
    icon: <CloseCircleOutlined />,
    label: 'Rejected',
    badgeStatus: 'error' as const,
  },
  [DocumentStatus.ARCHIVED]: {
    color: 'warning',
    icon: <FileTextOutlined />,
    label: 'Archived',
    badgeStatus: 'warning' as const,
  },
};

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  documentId,
  onViewVersion,
  onDownloadVersion,
  onEditVersion,
  onDeleteVersion,
  onCompareVersions,
  onApproveVersion,
  onRejectVersion,
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState<DocumentVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Use validation hook
  const { validateVersion, validateVersionWithModal, validating, ValidationModal } = useDocumentValidation({
    showModalOnInvalid: true,
    allowProceedOnInvalid: true, // Allow user to proceed even if validation fails
  });

  const handleStatusToggle = async (version: DocumentVersion, checked: boolean) => {
    const newStatus = checked ? DocumentStatus.PENDING_APPROVAL : DocumentStatus.DRAFT;
    
    try {
      setUpdatingStatus(version.id);
      await VersionApi.updateVersionStatus(documentId, version.id, newStatus);
      message.success(`Version status updated to ${newStatus}`);
      
      // Trigger a re-fetch by calling onEditVersion if available
      if (onEditVersion) {
        onEditVersion();
      }
    } catch (error) {
      message.error('Failed to update version status');
      console.error('Status update error:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleCompareClick = (version: DocumentVersion) => {
    if (!selectedForCompare) {
      setSelectedForCompare(version);
      setCompareMode(true);
      message.info('Select another version to compare');
    } else {
      if (selectedForCompare.id === version.id) {
        message.warning('Please select a different version');
        return;
      }
      onCompareVersions?.(selectedForCompare, version);
      setSelectedForCompare(null);
      setCompareMode(false);
    }
  };

  const handleViewWithValidation = async (version: DocumentVersion) => {
    if (onViewVersion) {
      await validateVersion(documentId, version.id, () => onViewVersion(version));
    }
  };

  const handleDownloadWithValidation = async (version: DocumentVersion) => {
    if (onDownloadVersion) {
      await validateVersion(documentId, version.id, () => onDownloadVersion(version));
    }
  };

  const getVersionMenu = (version: DocumentVersion) => (
    <Menu>
      {onViewVersion && (
        <Menu.Item 
          key="view" 
          icon={<EyeOutlined />}
          onClick={() => handleViewWithValidation(version)}
        >
          View Document
        </Menu.Item>
      )}
      {onDownloadVersion && (
        <Menu.Item 
          key="download" 
          icon={<DownloadOutlined />}
          onClick={() => handleDownloadWithValidation(version)}
        >
          Download
        </Menu.Item>
      )}
      <Menu.Item 
        key="validate" 
        icon={<SafetyCertificateOutlined />}
        onClick={() => validateVersionWithModal(documentId, version.id)}
      >
        Validate
      </Menu.Item>
      <Menu.Divider />
      {onEditVersion && version.status === DocumentStatus.DRAFT && (
        <Menu.Item 
          key="edit" 
          icon={<EditOutlined />}
          onClick={() => onEditVersion(version)}
        >
          Edit Metadata
        </Menu.Item>
      )}
      {onCompareVersions && versions.length > 1 && (
        <Menu.Item 
          key="compare" 
          icon={<SwapOutlined />}
          onClick={() => handleCompareClick(version)}
        >
          {compareMode && selectedForCompare?.id === version.id 
            ? 'Cancel Compare' 
            : 'Compare with...'}
        </Menu.Item>
      )}
      <Menu.Divider />
      {onApproveVersion && version.status !== DocumentStatus.APPROVED && (
        <Menu.Item 
          key="approve" 
          icon={<CheckCircleOutlined />}
          onClick={() => onApproveVersion(version)}
          style={{ color: '#52c41a' }}
        >
          Approve
        </Menu.Item>
      )}
      {onRejectVersion && version.status !== DocumentStatus.REJECTED && (
        <Menu.Item 
          key="reject" 
          icon={<CloseCircleOutlined />}
          onClick={() => onRejectVersion(version)}
          style={{ color: '#ff4d4f' }}
        >
          Reject
        </Menu.Item>
      )}
      {(onApproveVersion || onRejectVersion) && onDeleteVersion && <Menu.Divider />}
      {onDeleteVersion && versions.length > 1 && (
        <Menu.Item 
          key="delete" 
          icon={<DeleteOutlined />}
          danger
          onClick={() => onDeleteVersion(version)}
        >
          Delete Version
        </Menu.Item>
      )}
    </Menu>
  );

  const timelineItems = sortedVersions.map((version, index) => {
    const config = statusConfig[version.status] || statusConfig[DocumentStatus.DRAFT];
    const isLatest = version.isLatest;
    const isSelected = compareMode && selectedForCompare?.id === version.id;

    return {
      key: version.id,
      dot: (
        <div className={`
          flex items-center justify-center w-8 h-8 rounded-full 
          ${isLatest ? 'bg-blue-500' : 'bg-gray-400'}
          ${isSelected ? 'ring-4 ring-blue-300' : ''}
        `}>
          {config.icon && (
            <span className="text-white text-sm">
              {config.icon}
            </span>
          )}
        </div>
      ),
      color: isLatest ? 'blue' : 'gray',
      children: (
        <div 
          className={`
            p-4 rounded-lg border mb-4 transition-all
            ${isLatest ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
            ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
            hover:shadow-md
          `}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-base font-semibold text-gray-900">
                  Version {version.versionNumber}
                </h4>
                {isLatest && (
                  <Tag color="blue" className="text-xs">
                    Latest
                  </Tag>
                )}
                <Badge 
                  status={config.badgeStatus} 
                  text={config.label}
                />
                {/* Status Toggle Switch */}
                {(version.status === DocumentStatus.DRAFT || version.status === DocumentStatus.PENDING_APPROVAL) && (
                  <Tooltip title={`Switch to ${version.status === DocumentStatus.DRAFT ? 'Pending Approval' : 'Draft'}`}>
                    <Switch
                      size="small"
                      checked={version.status === DocumentStatus.PENDING_APPROVAL}
                      onChange={(checked) => handleStatusToggle(version, checked)}
                      loading={updatingStatus === version.id}
                      checkedChildren="Pending"
                      unCheckedChildren="Draft"
                      disabled={updatingStatus !== null}
                    />
                  </Tooltip>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <UserOutlined className="text-xs" />
                <span>
                  {(version.creator || version.createdBy)
                    ? `${(version.creator || version.createdBy)?.firstName} ${(version.creator || version.createdBy)?.lastName} (@${(version.creator || version.createdBy)?.username})`
                    : '—'}
                </span>
                <span>•</span>
                <ClockCircleOutlined className="text-xs" />
                <Tooltip title={dayjs(version.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                  <span>{dayjs(version.createdAt).fromNow()}</span>
                </Tooltip>
              </div>
            </div>

            {/* Actions */}
            <Dropdown overlay={getVersionMenu(version)} trigger={['click']}>
              <Button 
                type="text" 
                icon={<MoreOutlined />} 
                size="small"
              />
            </Dropdown>
          </div>

          {/* Comment */}
          {version.comment && (
            <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700 italic">
              &ldquo;{version.comment}&rdquo;
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FileTextOutlined />
              <span className="font-medium">{version.mimeType || 'Unknown type'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">{formatFileSize(version.fileSize)}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <Button 
              size="small" 
              icon={<SafetyCertificateOutlined />}
              onClick={() => validateVersionWithModal(documentId, version.id)}
              loading={validating}
            >
              Validate
            </Button>
            {onViewVersion && (
              <Button 
                size="small" 
                icon={<EyeOutlined />}
                onClick={() => handleViewWithValidation(version)}
                loading={validating}
              >
                View
              </Button>
            )}
            {onDownloadVersion && (
              <Button 
                size="small" 
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadWithValidation(version)}
                loading={validating}
              >
                Download
              </Button>
            )}
            {onApproveVersion && version.status !== DocumentStatus.APPROVED && (
              <Button 
                size="small" 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => onApproveVersion(version)}
                className="bg-green-500 hover:bg-green-600 border-green-500"
              >
                Approve
              </Button>
            )}
            {onRejectVersion && version.status !== DocumentStatus.REJECTED && (
              <Button 
                size="small" 
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => onRejectVersion(version)}
              >
                Reject
              </Button>
            )}
            {onDeleteVersion && versions.length > 1 && (
              <Button 
                size="small" 
                danger
                type="primary"
                icon={<DeleteOutlined />}
                onClick={() => onDeleteVersion(version)}
              >
                Delete
              </Button>
            )}
            {compareMode && (
              <Button 
                size="small" 
                type={isSelected ? 'primary' : 'default'}
                icon={<SwapOutlined />}
                onClick={() => handleCompareClick(version)}
              >
                {isSelected ? 'Selected' : 'Compare'}
              </Button>
            )}
          </div>
        </div>
      ),
    };
  });

  if (versions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <FileTextOutlined style={{ fontSize: 48 }} />
        <p className="mt-4">No versions available</p>
      </div>
    );
  }

  return (
    <div className="version-timeline">
      {compareMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <SwapOutlined />
            <span className="font-medium">
              {selectedForCompare 
                ? `Version ${selectedForCompare.versionNumber} selected. Click another version to compare.`
                : 'Compare mode active. Select two versions to compare.'}
            </span>
          </div>
          <Button 
            size="small" 
            onClick={() => {
              setCompareMode(false);
              setSelectedForCompare(null);
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      <Timeline items={timelineItems} />
      
      <ValidationModal />
    </div>
  );
};
