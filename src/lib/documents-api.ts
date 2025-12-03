import { ApiResult, apiGet, apiPut, apiPost, apiDelete, apiDownloadBlob } from '@/lib/api';
import { Document, DocumentsQueryParams, DocumentsResponse, Asset } from './types/document.types';

// Types with API response wrapper
export type ApiDocumentsResponse = {
    success: boolean;
    message: string;
    data: DocumentsResponse;
    timestamp: string;
    path: string;
    duration: string;
};

export type ApiDocumentDetailResponse = {
    success: boolean;
    message: string;
    data: {
        message: string;
        document: Document;
    };
    timestamp: string;
    path: string;
    duration: string;
};

export const DocumentsApi = {
    /**
     * Get all documents with optional filtering
     */
    getAll(params?: DocumentsQueryParams): Promise<ApiResult<ApiDocumentsResponse>> {
        // Convert params to URLSearchParams format
        const queryParams: Record<string, string | number | undefined> = {};

        if (params) {
            if (params.page) queryParams.page = params.page;
            if (params.limit) queryParams.limit = params.limit;
            if (params.search) queryParams.search = params.search;
            if (params.status) queryParams.status = params.status;
            if (params.securityLevel) queryParams.securityLevel = params.securityLevel;
            if (params.isConfidential !== undefined) queryParams.isConfidential = String(params.isConfidential);
            if (params.departmentId) queryParams.departmentId = params.departmentId;
            if (params.creatorId) queryParams.creatorId = params.creatorId;
            if (params.tag) queryParams.tag = params.tag;
            if (params.createdFrom) queryParams.createdFrom = params.createdFrom;
            if (params.createdTo) queryParams.createdTo = params.createdTo;
        }

        return apiGet<ApiDocumentsResponse>('/documents', { params: queryParams });
    },

    /**
     * Get public documents without authentication (for public page)
     */
    getPublicDocuments(params?: DocumentsQueryParams): Promise<ApiResult<ApiDocumentsResponse>> {
        // Convert params to URLSearchParams format
        const queryParams: Record<string, string | number | undefined> = {};

        if (params) {
            if (params.page) queryParams.page = params.page;
            if (params.limit) queryParams.limit = params.limit;
            if (params.search) queryParams.search = params.search;
            if (params.status) queryParams.status = params.status;
            if (params.departmentId) queryParams.departmentId = params.departmentId;
            if (params.creatorId) queryParams.creatorId = params.creatorId;
            if (params.tag) queryParams.tag = params.tag;
            if (params.createdFrom) queryParams.createdFrom = params.createdFrom;
            if (params.createdTo) queryParams.createdTo = params.createdTo;
        }

        // Use special endpoint that doesn't require authentication and forces PUBLIC security level
        return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/documents/public?${new URLSearchParams(queryParams as Record<string, string>).toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            const data = await response.json();
            return {
                status: response.status,
                statusText: response.statusText,
                data: data,
            };
        });
    },

    /**
     * Get public document by ID without authentication
     */
    getPublicDocumentById(id: string): Promise<ApiResult<ApiDocumentDetailResponse>> {
        return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/documents/public/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async response => {
            const data = await response.json();
            return {
                status: response.status,
                statusText: response.statusText,
                data: data,
            };
        });
    },

    /**
     * Get document by ID
     */
    getById(id: string): Promise<ApiResult<ApiDocumentDetailResponse>> {
        return apiGet<ApiDocumentDetailResponse>(`/documents/${id}`);
    },

    /**
     * Update document
     */
    updateDocument(id: string, documentData: any): Promise<ApiResult<ApiDocumentDetailResponse>> {
        return apiPut<ApiDocumentDetailResponse>(`/documents/${id}`, documentData);
    },

    /**
     * Create new document
     */
    createDocument(documentData: any): Promise<ApiResult<{
        message: string;
        document: Document;
    }>> {
        return apiPost<{
            message: string;
            document: Document;
        }>('/documents', documentData);
    },

    /**
     * Delete document by ID
     */
    deleteDocument(id: string): Promise<ApiResult<{
        message: string;
    }>> {
        return apiDelete<{
            message: string;
        }>(`/documents/${id}`);
    },

    /**
     * Generate presigned URL for cover image upload
     */
    generateCoverPresignedUrl(id: string, fileName: string, contentType: string): Promise<ApiResult<{
        presignedUrl: string;
        key: string;
        publicUrl: string;
    }>> {
        return apiPost<{
            presignedUrl: string;
            key: string;
            publicUrl: string;
        }>(`/documents/${id}/assets/cover/presigned-url`, {
            fileName,
            contentType
        });
    },

    /**
     * Generate presigned URL for document file upload
     */
    generateDocumentPresignedUrl(id: string, fileName: string, contentType: string): Promise<ApiResult<{
        presignedUrl: string;
        key: string;
        publicUrl: string;
    }>> {
        return apiPost<{
            presignedUrl: string;
            key: string;
            publicUrl: string;
        }>(`/documents/${id}/assets/presigned-url`, {
            fileName,
            contentType
        });
    },

    /**
     * Link uploaded cover image to document
     */
    linkCoverImage(id: string, data: {
        s3Key: string;
        filename: string;
        contentType: string;
        sizeBytes?: number;
    }): Promise<ApiResult<{
        message: string;
        asset: any;
    }>> {
        return apiPost<{
            message: string;
            asset: any;
        }>(`/documents/${id}/assets/cover`, {
            s3Key: data.s3Key,
            filename: data.filename,
            contentType: data.contentType,
            sizeBytes: data.sizeBytes
        });
    },

    /**
     * Link document file after S3 upload
     */
    linkDocumentFile(id: string, data: {
        s3Key: string;
        filename: string;
        contentType: string;
        sizeBytes?: number;
    }): Promise<ApiResult<{
        message: string;
        asset: any;
    }>> {
        return apiPost<{
            message: string;
            asset: any;
        }>(`/documents/${id}/assets`, {
            s3Key: data.s3Key,
            filename: data.filename,
            contentType: data.contentType,
            sizeBytes: data.sizeBytes,
            isCover: false
        });
    },

    /**
     * Download file from S3 through backend
     */
    async downloadFile(keyPath: string): Promise<Blob> {
        return apiDownloadBlob(`/documents/files/download/${encodeURIComponent(keyPath)}`, {
            requiresAuth: true
        });
    },

    /**
     * Download file for public documents (no authentication required)
     */
    async downloadFilePublic(keyPath: string): Promise<Blob> {
        return apiDownloadBlob(`/documents/files/download/${encodeURIComponent(keyPath)}`, {
            requiresAuth: false
        });
    },

    /**
     * Get file view URL for streaming
     */
    getFileViewUrl(keyPath: string): string {
        return `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/documents/files/view/${encodeURIComponent(keyPath)}`;
    },

    /**
     * Get file view URL for public documents (no authentication required)
     */
    getFileViewUrlPublic(keyPath: string): string {
        return `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api/documents/files/view/${encodeURIComponent(keyPath)}`;
    },

    /**
     * Get document assets (files uploaded to document)
     */
    getDocumentAssets(id: string): Promise<ApiResult<{
        assets: Asset[];
    }>> {
        return apiGet<{
            assets: Asset[];
        }>(`/documents/${id}/assets`);
    },

    /**
     * Setup S3 CORS policy for frontend uploads
     */
    setupS3Cors(): Promise<ApiResult<{
        message: string;
        timestamp: string;
    }>> {
        return apiPost<{
            message: string;
            timestamp: string;
        }>('/documents/setup-s3-cors', {});
    },

    /**
     * Delete document asset by ID
     */
    deleteDocumentAsset(documentId: string, assetId: string): Promise<ApiResult<{
        message: string;
        deletedAsset: {
            assetId: string;
            deletedAt: string;
        };
    }>> {
        return apiDelete<{
            message: string;
            deletedAsset: {
                assetId: string;
                deletedAt: string;
            };
        }>(`/documents/${documentId}/assets/${assetId}`);
    },

    /**
     * Update document status only
     */
    updateDocumentStatus(id: string, status: string): Promise<ApiResult<ApiDocumentDetailResponse>> {
        return apiPut<ApiDocumentDetailResponse>(`/documents/${id}`, { status });
    },

    /**
     * Create document comment
     */
    createDocumentComment(id: string, data: { content: string; isInternal?: boolean }): Promise<ApiResult<{
        message: string;
        comment: any;
    }>> {
        return apiPost<{
            message: string;
            comment: any;
        }>(`/documents/${id}/comments`, data);
    },

    /**
     * Generate presigned URL for document version upload
     */
    generateVersionPresignedUrl(id: string, fileName: string, contentType: string): Promise<ApiResult<{
        presignedUrl: string;
        key: string;
        publicUrl: string;
        message: string;
    }>> {
        return apiPost<{
            presignedUrl: string;
            key: string;
            publicUrl: string;
            message: string;
        }>(`/documents/${id}/versions/presigned-url`, {
            fileName,
            contentType
        });
    },

    /**
     * Create document version after upload
     */
    createDocumentVersion(id: string, data: {
        s3Key: string;
        s3Url: string;
        fileSize: number;
        mimeType: string;
        checksum?: string;
        versionNumber?: number;
    }): Promise<ApiResult<{
        message: string;
        version: any;
    }>> {
        return apiPost<{
            message: string;
            version: any;
        }>(`/documents/${id}/versions`, data);
    },

    /**
     * Generate presigned URL for document asset upload
     */
    generateAssetPresignedUrl(id: string, fileName: string, contentType: string): Promise<ApiResult<{
        presignedUrl: string;
        key: string;
        publicUrl: string;
        message: string;
    }>> {
        return apiPost<{
            presignedUrl: string;
            key: string;
            publicUrl: string;
            message: string;
        }>(`/documents/${id}/assets/presigned-url`, {
            fileName,
            contentType
        });
    },

    /**
     * Link uploaded asset to document
     */
    linkAssetToDocument(id: string, data: {
        s3Key: string;
        filename: string;
        contentType: string;
        sizeBytes: number;
        isCover: boolean;
    }): Promise<ApiResult<{
        message: string;
        asset: any;
    }>> {
        return apiPost<{
            message: string;
            asset: any;
        }>(`/documents/${id}/assets`, data);
    },
};

/**
 * Get cover image URL for a document
 * Returns a placeholder if no cover is available
 */
export function getDocumentCoverUrl(coverAsset?: { s3Url: string } | null): string {
    if (coverAsset && coverAsset.s3Url) {
        return coverAsset.s3Url;
    }
    return 'https://placehold.co/600x400';
}

/**
 * Upload cover image for a document using presigned URL
 */
export async function uploadDocumentCover(documentId: string, file: File): Promise<string> {
    try {
        try {
            await DocumentsApi.setupS3Cors();
        } catch (corsError) {
            // Continue anyway - CORS might already be configured
        }

        const presignedResponse = await DocumentsApi.generateCoverPresignedUrl(
            documentId,
            file.name,
            file.type
        );

        // Handle nested response structure from backend
        let presignedData;
        const responseData = presignedResponse.data as any;
        if (responseData.data) {
            // If response is wrapped like { data: { data: { presignedUrl, key, publicUrl } } }
            presignedData = responseData.data;
        } else {
            // If response is direct like { data: { presignedUrl, key, publicUrl } }
            presignedData = responseData;
        }

        const uploadResponse = await fetch(presignedData.presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file to S3: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        // Step 3: Link the uploaded file to the document
        const linkPayload = {
            s3Key: presignedData.key,
            filename: file.name,
            contentType: file.type,
            sizeBytes: file.size
        };

        const linkResponse = await DocumentsApi.linkCoverImage(documentId, linkPayload);

        if (linkResponse.status >= 200 && linkResponse.status < 300) {
            return presignedData.publicUrl;
        } else {
            throw new Error(`Failed to link cover image to document. Status: ${linkResponse.status}`);
        }
    } catch (error) {

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error: Unable to connect to server');
            } else if (error.message.includes('S3')) {
                throw new Error('S3 upload failed: ' + error.message);
            } else if (error.message.includes('link')) {
                throw new Error('Failed to link image to document: ' + error.message);
            }
        }

        throw error;
    }
}

/**
 * Upload document file using presigned URL
 */
export async function uploadDocumentFile(documentId: string, file: File): Promise<string> {
    try {
        try {
            await DocumentsApi.setupS3Cors();
        } catch (corsError) {
            // Continue anyway - CORS might already be configured
        }

        const presignedResponse = await DocumentsApi.generateDocumentPresignedUrl(
            documentId,
            file.name,
            file.type
        );

        // Handle nested response structure from backend
        let presignedData;
        const responseData = presignedResponse.data as any;
        if (responseData.data) {
            presignedData = responseData.data;
        } else {
            presignedData = responseData;
        }

        const uploadResponse = await fetch(presignedData.presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file to S3: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        // Step 3a: Create document version (auto-increment version number)
        await DocumentsApi.createDocumentVersion(documentId, {
            s3Key: presignedData.key,
            s3Url: presignedData.publicUrl,
            fileSize: file.size,
            mimeType: file.type,
            checksum: '', // Optional
            // versionNumber will be auto-generated by backend
        });

        // Step 3b: Link the uploaded file as asset (for backward compatibility)
        const linkPayload = {
            s3Key: presignedData.key,
            filename: file.name,
            contentType: file.type,
            sizeBytes: file.size
        };

        const linkResponse = await DocumentsApi.linkDocumentFile(documentId, linkPayload);

        if (linkResponse.status >= 200 && linkResponse.status < 300) {
            return presignedData.publicUrl;
        } else {
            throw new Error(`Failed to link document file. Status: ${linkResponse.status}`);
        }
    } catch (error) {

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Network error: Unable to connect to server');
            } else if (error.message.includes('S3')) {
                throw new Error('S3 upload failed: ' + error.message);
            } else if (error.message.includes('link')) {
                throw new Error('Failed to link file to document: ' + error.message);
            }
        }

        throw error;
    }
}