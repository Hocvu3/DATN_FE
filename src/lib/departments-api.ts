import { ApiResult, apiGet } from '@/lib/api';
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

export const DepartmentsApi = {
    /**
     * Get all departments
     */
    getAll(): Promise<ApiResult<ApiDepartmentsResponse>> {
        return apiGet<ApiDepartmentsResponse>('/departments');
    },
};