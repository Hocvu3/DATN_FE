'use client';

import React from 'react';
import { Card, Row, Col, Badge, Tag, Descriptions, Space, Divider, Alert } from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SwapOutlined,
  ArrowRightOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import { DocumentVersion, DocumentStatus } from '@/lib/types/document.types';
import dayjs from 'dayjs';

interface VersionComparisonProps {
  version1: DocumentVersion;
  version2: DocumentVersion;
  comparisonData?: {
    fileSizeDiff: number;
    checksumChanged: boolean;
    statusChanged: boolean;
    mimeTypeChanged: boolean;
    metadataChanges: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
  };
}

const statusConfig = {
  [DocumentStatus.DRAFT]: {
    color: 'default',
    label: 'Draft',
  },
  [DocumentStatus.PENDING_APPROVAL]: {
    color: 'processing',
    label: 'Pending Approval',
  },
  [DocumentStatus.APPROVED]: {
    color: 'success',
    label: 'Approved',
  },
  [DocumentStatus.REJECTED]: {
    color: 'error',
    label: 'Rejected',
  },
  [DocumentStatus.ARCHIVED]: {
    color: 'warning',
    label: 'Archived',
  },
};

export const VersionComparison: React.FC<VersionComparisonProps> = ({
  version1,
  version2,
  comparisonData,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatFileSizeDiff = (diff: number) => {
    const isIncrease = diff > 0;
    const absDiff = Math.abs(diff);
    const formattedDiff = formatFileSize(absDiff);
    const icon = isIncrease ? '↑' : '↓';
    const color = isIncrease ? 'text-red-600' : 'text-green-600';
    
    return (
      <span className={`font-medium ${color}`}>
        {icon} {formattedDiff} ({isIncrease ? '+' : ''}{((diff / version1.fileSize) * 100).toFixed(1)}%)
      </span>
    );
  };

  const olderVersion = version1.versionNumber < version2.versionNumber ? version1 : version2;
  const newerVersion = version1.versionNumber > version2.versionNumber ? version1 : version2;

  const fileSizeDiff = comparisonData?.fileSizeDiff ?? (newerVersion.fileSize - olderVersion.fileSize);
  const checksumChanged = comparisonData?.checksumChanged ?? (newerVersion.checksum !== olderVersion.checksum);
  const statusChanged = comparisonData?.statusChanged ?? (newerVersion.status !== olderVersion.status);
  const mimeTypeChanged = comparisonData?.mimeTypeChanged ?? (newerVersion.mimeType !== olderVersion.mimeType);

  const renderVersionCard = (version: DocumentVersion, isOlder: boolean) => {
    const config = statusConfig[version.status] || statusConfig[DocumentStatus.DRAFT];
    
    return (
      <Card
        title={
          <div className="flex items-center justify-between">
            <Space>
              <span className="font-semibold">Version {version.versionNumber}</span>
              {version.isLatest && <Tag color="blue">Latest</Tag>}
              {isOlder && <Tag>Older</Tag>}
              {!isOlder && <Tag color="green">Newer</Tag>}
            </Space>
            <Badge status={config.color as any} text={config.label} />
          </div>
        }
        className={`shadow-sm ${isOlder ? 'border-l-4 border-l-gray-400' : 'border-l-4 border-l-green-500'}`}
      >
        <Descriptions column={1} size="small" className="text-sm">
          <Descriptions.Item 
            label={
              <span className="flex items-center gap-2">
                <UserOutlined /> Created By
              </span>
            }
          >
            {version.createdBy 
              ? `${version.createdBy.firstName} ${version.createdBy.lastName}`
              : 'Unknown User'}
          </Descriptions.Item>
          
          <Descriptions.Item 
            label={
              <span className="flex items-center gap-2">
                <ClockCircleOutlined /> Created At
              </span>
            }
          >
            {dayjs(version.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            <div className="text-gray-500 text-xs">
              ({dayjs(version.createdAt).fromNow()})
            </div>
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <span className="flex items-center gap-2">
                <FileTextOutlined /> File Size
              </span>
            }
          >
            {formatFileSize(version.fileSize)}
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <span className="flex items-center gap-2">
                <FileTextOutlined /> MIME Type
              </span>
            }
          >
            {version.mimeType || 'Unknown'}
          </Descriptions.Item>

          <Descriptions.Item 
            label={
              <span className="flex items-center gap-2">
                <FileProtectOutlined /> Checksum
              </span>
            }
          >
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              {version.checksum.substring(0, 16)}...
            </code>
          </Descriptions.Item>

          {version.comment && (
            <Descriptions.Item label="Comment">
              <div className="italic text-gray-700 p-2 bg-gray-50 rounded">
                &ldquo;{version.comment}&rdquo;
              </div>
            </Descriptions.Item>
          )}

          {version.thumbnailUrl && (
            <Descriptions.Item label="Thumbnail">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={version.thumbnailUrl} 
                alt={`Version ${version.versionNumber} thumbnail`}
                className="max-w-full h-auto rounded border"
              />
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    );
  };

  return (
    <div className="version-comparison">
      {/* Summary */}
      <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-center gap-4">
          <Tag color="default" className="text-base py-1 px-3">
            Version {olderVersion.versionNumber}
          </Tag>
          <ArrowRightOutlined className="text-2xl text-blue-500" />
          <Tag color="green" className="text-base py-1 px-3">
            Version {newerVersion.versionNumber}
          </Tag>
        </div>
        
        <Divider className="my-3" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-600 text-sm mb-1">File Size Change</div>
            <div className="font-medium">
              {fileSizeDiff === 0 ? (
                <span className="text-gray-500">No change</span>
              ) : (
                formatFileSizeDiff(fileSizeDiff)
              )}
            </div>
          </div>

          <div>
            <div className="text-gray-600 text-sm mb-1">Content Changed</div>
            <div className="font-medium">
              {checksumChanged ? (
                <span className="text-orange-600 flex items-center justify-center gap-1">
                  <WarningOutlined /> Yes
                </span>
              ) : (
                <span className="text-green-600 flex items-center justify-center gap-1">
                  <CheckCircleOutlined /> No
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="text-gray-600 text-sm mb-1">Status Changed</div>
            <div className="font-medium">
              {statusChanged ? (
                <span className="text-blue-600 flex items-center justify-center gap-1">
                  <SwapOutlined /> Yes
                </span>
              ) : (
                <span className="text-gray-500">No</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Change Alerts */}
      <Space direction="vertical" className="w-full mb-4">
        {mimeTypeChanged && (
          <Alert
            type="warning"
            message="MIME Type Changed"
            description={
              <div>
                Changed from <Tag>{olderVersion.mimeType}</Tag> to{' '}
                <Tag>{newerVersion.mimeType}</Tag>
              </div>
            }
            icon={<WarningOutlined />}
            showIcon
          />
        )}

        {statusChanged && (
          <Alert
            type="info"
            message="Status Changed"
            description={
              <div className="flex items-center gap-2">
                <Badge 
                  status={statusConfig[olderVersion.status].color as any} 
                  text={statusConfig[olderVersion.status].label} 
                />
                <ArrowRightOutlined />
                <Badge 
                  status={statusConfig[newerVersion.status].color as any} 
                  text={statusConfig[newerVersion.status].label} 
                />
              </div>
            }
            icon={<SwapOutlined />}
            showIcon
          />
        )}

        {checksumChanged && (
          <Alert
            type="warning"
            message="File Content Changed"
            description="The checksum has changed, indicating the file content has been modified."
            icon={<FileProtectOutlined />}
            showIcon
          />
        )}
      </Space>

      {/* Side-by-Side Comparison */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          {renderVersionCard(olderVersion, true)}
        </Col>
        <Col xs={24} lg={12}>
          {renderVersionCard(newerVersion, false)}
        </Col>
      </Row>

      {/* Metadata Changes */}
      {comparisonData?.metadataChanges && comparisonData.metadataChanges.length > 0 && (
        <Card title="Metadata Changes" className="mt-4">
          <Descriptions column={1} bordered size="small">
            {comparisonData.metadataChanges.map((change, index) => (
              <Descriptions.Item 
                key={index} 
                label={change.field}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Tag color="red" className="w-full">
                      {String(change.oldValue)}
                    </Tag>
                  </div>
                  <ArrowRightOutlined className="text-gray-400" />
                  <div className="flex-1">
                    <Tag color="green" className="w-full">
                      {String(change.newValue)}
                    </Tag>
                  </div>
                </div>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      )}
    </div>
  );
};
