import { ApiResult, apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Department } from './types/document.types';

// Types with API response wrapper
export type ApiDepartmentsResponse = {
    success: boolean;
    message: string;
    data: {
        message: string;
        departments: Department[];
    };
    timestamp: string;
    path: string;
    duration: string;
};

export type ApiDepartmentResponse = {
    success: boolean;
    message: string;
    data: {
        message: string;
        department: Department;
    };
    timestamp: string;
    path: string;
    duration: string;
};

export type ApiDepartmentUsersResponse = {
    success: boolean;
    message: string;
    data: {
        message: string;
        users: any[];
        total: number;
    };
    timestamp: string;
    path: string;
    duration: string;
};

export type ApiDepartmentDocumentsResponse = {
    success: boolean;
    message: string;
    data: {
        message: string;
        documents: any[];
        total: number;
    };
    timestamp: string;
    path: string;
    duration: string;
};

export type ApiDeleteResponse = {
    success: boolean;
    message: string;
    data: {
        message: string;
    };
    timestamp: string;
    path: string;
    duration: string;
};

export const DepartmentsApi = {
    /**
     * Get all departments
     */
    getAll(search?: string): Promise<ApiResult<ApiDepartmentsResponse>> {
        const queryParams: Record<string, string> = {};
        if (search) {
            queryParams.search = search;
        }
        return apiGet<ApiDepartmentsResponse>('/departments', { params: queryParams });
    },

    /**
     * Get department by ID
     */
    getById(id: string): Promise<ApiResult<ApiDepartmentResponse>> {
        return apiGet<ApiDepartmentResponse>(`/departments/${id}`);
    },

    /**
     * Get users in department
     */
    getDepartmentUsers(id: string, params?: { isActive?: boolean }): Promise<ApiResult<ApiDepartmentUsersResponse>> {
        const queryParams: Record<string, string> = {};
        if (params?.isActive !== undefined) {
            queryParams.isActive = String(params.isActive);
        }
        return apiGet<ApiDepartmentUsersResponse>(`/departments/${id}/users`, { params: queryParams });
    },

    /**
     * Get documents in department
     */
    getDepartmentDocuments(id: string): Promise<ApiResult<ApiDepartmentDocumentsResponse>> {
        return apiGet<ApiDepartmentDocumentsResponse>(`/departments/${id}/documents`);
    },

    /**
     * Create department
     */
    create(data: { 
        name: string; 
        description?: string; 
        isActive?: boolean;
    }): Promise<ApiResult<ApiDepartmentResponse>> {
        return apiPost<ApiDepartmentResponse>('/departments', data);
    },

    /**
     * Update department
     */
    update(id: string, data: { 
        name?: string; 
        description?: string; 
        isActive?: boolean;
    }): Promise<ApiResult<ApiDepartmentResponse>> {
        return apiPut<ApiDepartmentResponse>(`/departments/${id}`, data);
    },

    /**
     * Delete department
     */
    delete(id: string): Promise<ApiResult<ApiDeleteResponse>> {
        return apiDelete<ApiDeleteResponse>(`/departments/${id}`);
    },
};