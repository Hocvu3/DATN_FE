import { ApiResult, apiGet, apiPut, apiPost, apiDelete } from '@/lib/api';
import { DocumentVersion, DocumentStatus } from './types/document.types';

export interface VersionStatistics {
    totalVersions: number;
    versionsByStatus: Record<DocumentStatus, number>;
    latestVersion: number;
}

export interface VersionComparison {
    oldVersion: DocumentVersion;
    newVersion: DocumentVersion;
    changes: {
        fileSize: { old: number; new: number; diff: number };
        checksum: { changed: boolean };
        mimeType: { changed: boolean; old: string; new: string };
        status: { changed: boolean; old: DocumentStatus; new: DocumentStatus };
    };
}

export const VersionApi = {
    /**
     * Get all versions for a document
     */
    getVersionsByDocumentId(documentId: string): Promise<ApiResult<{
        versions: DocumentVersion[];
        total: number;
    }>> {
        return apiGet<{
            versions: DocumentVersion[];
            total: number;
        }>(`/documents/${documentId}/versions`);
    },

    /**
     * Get specific version by ID
     */
    getVersionById(documentId: string, versionId: string): Promise<ApiResult<{
        version: DocumentVersion;
    }>> {
        return apiGet<{
            version: DocumentVersion;
        }>(`/documents/${documentId}/versions/${versionId}`);
    },

    /**
     * Get latest version of a document
     */
    getLatestVersion(documentId: string): Promise<ApiResult<{
        version: DocumentVersion;
    }>> {
        return apiGet<{
            version: DocumentVersion;
        }>(`/documents/${documentId}/versions/latest`);
    },

    /**
     * Create new version
     */
    createVersion(documentId: string, data: {
        filePath: string;
        s3Key: string | null;
        s3Url: string | null;
        fileSize: number;
        checksum: string;
        mimeType: string;
        comment?: string | null;
        isEncrypted?: boolean;
        encryptionKey?: string | null;
    }): Promise<ApiResult<{
        message: string;
        version: DocumentVersion;
    }>> {
        return apiPost<{
            message: string;
            version: DocumentVersion;
        }>(`/documents/${documentId}/versions`, data);
    },

    /**
     * Update existing version (metadata only, not for signed versions)
     */
    updateVersion(documentId: string, versionId: string, data: {
        comment?: string;
        filePath?: string;
        s3Key?: string;
        s3Url?: string;
        fileSize?: number;
        checksum?: string;
        mimeType?: string;
    }): Promise<ApiResult<{
        message: string;
        version: DocumentVersion;
    }>> {
        return apiPut<{
            message: string;
            version: DocumentVersion;
        }>(`/documents/${documentId}/versions/${versionId}`, data);
    },

    /**
     * Delete version (cannot delete only version or signed versions)
     */
    deleteVersion(documentId: string, versionId: string): Promise<ApiResult<{
        message: string;
    }>> {
        return apiDelete<{
            message: string;
        }>(`/documents/${documentId}/versions/${versionId}`);
    },

    /**
     * Update version status (DRAFT → PENDING_APPROVAL → APPROVED/REJECTED)
     */
    updateVersionStatus(documentId: string, versionId: string, status: DocumentStatus): Promise<ApiResult<{
        message: string;
        version: DocumentVersion;
    }>> {
        return apiPut<{
            message: string;
            version: DocumentVersion;
        }>(`/documents/${documentId}/versions/${versionId}/status`, { status });
    },

    /**
     * Get version statistics for a document
     */
    getVersionStatistics(documentId: string): Promise<ApiResult<{
        statistics: VersionStatistics;
    }>> {
        return apiGet<{
            statistics: VersionStatistics;
        }>(`/documents/${documentId}/versions/statistics`);
    },

    /**
     * Compare two versions
     */
    compareVersions(documentId: string, oldVersionId: string, newVersionId: string): Promise<ApiResult<{
        comparison: VersionComparison;
    }>> {
        return apiGet<{
            comparison: VersionComparison;
        }>(`/documents/${documentId}/versions/compare`, {
            params: { oldVersionId, newVersionId }
        });
    },

    /**
     * Validate version integrity (authenticated)
     */
    validateVersion(documentId: string, versionId: string): Promise<ApiResult<{
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
    }>> {
        return apiGet<{
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
        }>(`/documents/${documentId}/versions/${versionId}/validate`);
    },

    /**
     * Validate version integrity (public - no auth required)
     */
    validateVersionPublic(documentId: string, versionId: string): Promise<ApiResult<{
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
    }>> {
        return apiGet<{
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
        }>(`/documents/${documentId}/versions/${versionId}/validate-public`);
    },

    /**
     * Approve document version
     */
    approveVersion(
        documentId: string,
        versionId: string,
        data: { signatureStampId?: string; reason?: string; type?: number }
    ): Promise<ApiResult<any>> {
        return apiPost(`/documents/${documentId}/versions/${versionId}/approve`, data);
    },

    /**
     * Reject document version
     */
    rejectVersion(
        documentId: string,
        versionId: string,
        reason: string
    ): Promise<ApiResult<any>> {
        return apiPost(`/documents/${documentId}/versions/${versionId}/reject`, { reason });
    },
};
