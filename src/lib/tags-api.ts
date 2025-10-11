import { ApiResult, apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

// Tag types
export interface Tag {
    id: string;
    name: string;
    color?: string;
    description?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    documents?: TagDocument[];
    _count?: {
        documents: number;
    };
    documentCount?: number;
}

export interface TagDocument {
    id: string;
    documentId: string;
    tagId: string;
    document?: {
        id: string;
        title: string;
        description?: string;
        documentNumber: string;
        status: string;
        securityLevel: string;
        isConfidential: boolean;
        createdAt: string;
        updatedAt: string;
        creatorId: string;
        approverId?: string;
        departmentId?: string;
    };
}

// API response types
export type ApiTagsResponse = {
    success: boolean;
    message: string;
    data: {
        tags: Tag[];
        total: number;
        page: number;
        limit: number;
    };
    timestamp: string;
    path: string;
    duration: string;
};

export type ApiTagDetailResponse = {
    success: boolean;
    message: string;
    data: {
        message: string;
        tag: Tag;
    };
    timestamp: string;
    path: string;
    duration: string;
};

export const TagsApi = {
    /**
     * Get all tags
     */
    getAll(): Promise<ApiResult<ApiTagsResponse>> {
        return apiGet<ApiTagsResponse>('/tags');
    },

    /**
     * Get tag by ID
     */
    getById(id: string): Promise<ApiResult<ApiTagDetailResponse>> {
        return apiGet<ApiTagDetailResponse>(`/tags/${id}`);
    },

    /**
     * Create a new tag
     */
    create(data: { name: string; color?: string; description?: string }): Promise<ApiResult<ApiTagDetailResponse>> {
        return apiPost<ApiTagDetailResponse>('/tags', data);
    },

    /**
     * Update a tag
     */
    update(id: string, data: { name?: string; color?: string; description?: string; isActive?: boolean }): Promise<ApiResult<ApiTagDetailResponse>> {
        return apiPut<ApiTagDetailResponse>(`/tags/${id}`, data);
    },

    /**
     * Delete a tag
     */
    delete(id: string): Promise<ApiResult<{ success: boolean; message: string }>> {
        return apiDelete<{ success: boolean; message: string }>(`/tags/${id}`);
    },
};