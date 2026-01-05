import { ApiResult, apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Document, DocumentsQueryParams } from './types/document.types';

// Dashboard Stats Types
export interface EmployeeDashboardStats {
  overview: {
    myDocuments: number;
    pendingReviews: number;
    completedThisMonth: number;
    growthPercentage: number;
  };
  documentsByStatus: Array<{
    status: string;
    name: string;
    count: number;
    color: string;
  }>;
  documentsPerDay: Array<{
    date: string;
    dayName: string;
    count: number;
  }>;
  recentDocuments: Array<{
    id: string;
    title: string;
    documentNumber: string;
    status: string;
    createdAt: string;
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: string;
  }>;
}

// API Response Types
export type ApiEmployeeDashboardResponse = {
  success: boolean;
  message: string;
  data: EmployeeDashboardStats;
  timestamp: string;
  path: string;
  duration: string;
};

export type ApiEmployeeDocumentsResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
    documents: Document[];
    total: number;
    page: number;
    limit: number;
  };
  timestamp: string;
  path: string;
  duration: string;
};

export type ApiEmployeeDocumentDetailResponse = {
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

export type ApiEmployeeActivitiesResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
    activities: any[];
    total: number;
    page: number;
    limit: number;
  };
  timestamp: string;
  path: string;
  duration: string;
};

/**
 * Employee API Service
 * Handles all API calls for employee role
 */
export const EmployeeApi = {
  /**
   * Get employee dashboard statistics
   */
  getDashboardStats(): Promise<ApiResult<ApiEmployeeDashboardResponse>> {
    return apiGet<ApiEmployeeDashboardResponse>('/documents/dashboard-stats');
  },

  /**
   * Get employee documents with filtering and pagination
   */
  getDocuments(params?: DocumentsQueryParams): Promise<ApiResult<ApiEmployeeDocumentsResponse>> {
    const queryParams: Record<string, string | number | undefined> = {};

    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.securityLevel) queryParams.securityLevel = params.securityLevel;
      if (params.isConfidential !== undefined) queryParams.isConfidential = String(params.isConfidential);
      if (params.tag) queryParams.tag = params.tag;
      if (params.createdFrom) queryParams.createdFrom = params.createdFrom;
      if (params.createdTo) queryParams.createdTo = params.createdTo;
    }

    return apiGet<ApiEmployeeDocumentsResponse>('/documents', { params: queryParams });
  },

  /**
   * Get document by ID (employee access)
   */
  getDocumentById(id: string): Promise<ApiResult<ApiEmployeeDocumentDetailResponse>> {
    return apiGet<ApiEmployeeDocumentDetailResponse>(`/documents/${id}`);
  },

  /**
   * Create document
   */
  createDocument(data: any): Promise<ApiResult<any>> {
    return apiPost<any>('/documents', data);
  },

  /**
   * Update document
   */
  updateDocument(id: string, data: any): Promise<ApiResult<any>> {
    return apiPut<any>(`/documents/${id}`, data);
  },

  /**
   * Delete document
   */
  deleteDocument(id: string): Promise<ApiResult<any>> {
    return apiDelete<any>(`/documents/${id}`);
  },

  /**
   * Submit document for approval
   */
  submitForApproval(id: string): Promise<ApiResult<any>> {
    return apiPost<any>(`/documents/${id}/submit`, {});
  },

  /**
   * Get employee activities
   */
  getActivities(params?: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResult<ApiEmployeeActivitiesResponse>> {
    const queryParams: Record<string, string | number | undefined> = {};

    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.action) queryParams.action = params.action;
      if (params.entityType) queryParams.entityType = params.entityType;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
    }

    return apiGet<ApiEmployeeActivitiesResponse>('/admin/audit-logs/my-activities', { params: queryParams });
  },

  /**
   * Get my department info
   */
  getMyDepartment(): Promise<ApiResult<any>> {
    return apiGet<any>('/users/my-department');
  },

  /**
   * Get department members (read-only for employee)
   */
  getDepartmentMembers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResult<any>> {
    const queryParams: Record<string, string | number | undefined> = {};

    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.search) queryParams.search = params.search;
    }

    return apiGet<any>('/users/department-members', { params: queryParams });
  },
};
