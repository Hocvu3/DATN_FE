import { ApiResult, apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Document, DocumentsQueryParams } from './types/document.types';

// Dashboard Stats Types
export interface DepartmentDashboardStats {
  overview: {
    totalDocuments: number;
    totalMembers: number;
    pendingApprovals: number;
    documentsThisMonth: number;
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
    creator: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  topCreators: Array<{
    name: string;
    count: number;
  }>;
}

// API Response Types
export type ApiDepartmentDashboardResponse = {
  success: boolean;
  message: string;
  data: DepartmentDashboardStats;
  timestamp: string;
  path: string;
  duration: string;
};

export type ApiDepartmentDocumentsResponse = {
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

export type ApiDepartmentMembersResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
    users: any[];
    total: number;
    page: number;
    limit: number;
  };
  timestamp: string;
  path: string;
  duration: string;
};

export type ApiDepartmentDocumentDetailResponse = {
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

/**
 * Department API Service
 * Handles all API calls for department role
 */
export const DepartmentApi = {
  /**
   * Get department dashboard statistics
   */
  getDashboardStats(): Promise<ApiResult<ApiDepartmentDashboardResponse>> {
    return apiGet<ApiDepartmentDashboardResponse>('/dashboard-stats');
  },

  /**
   * Get department documents with filtering and pagination
   */
  getDocuments(params?: DocumentsQueryParams): Promise<ApiResult<ApiDepartmentDocumentsResponse>> {
    const queryParams: Record<string, string | number | undefined> = {};

    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.securityLevel) queryParams.securityLevel = params.securityLevel;
      if (params.isConfidential !== undefined) queryParams.isConfidential = String(params.isConfidential);
      if (params.creatorId) queryParams.creatorId = params.creatorId;
      if (params.tag) queryParams.tag = params.tag;
      if (params.createdFrom) queryParams.createdFrom = params.createdFrom;
      if (params.createdTo) queryParams.createdTo = params.createdTo;
    }

    return apiGet<ApiDepartmentDocumentsResponse>('/documents', { params: queryParams });
  },

  /**
   * Get document by ID (department access)
   */
  getDocumentById(id: string): Promise<ApiResult<ApiDepartmentDocumentDetailResponse>> {
    return apiGet<ApiDepartmentDocumentDetailResponse>(`/documents/${id}`);
  },

  /**
   * Get department members/users
   */
  getMembers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    roleId?: string;
    sortField?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<ApiResult<ApiDepartmentMembersResponse>> {
    const queryParams: Record<string, string | number | undefined> = {};

    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.search) queryParams.search = params.search;
      if (params.isActive !== undefined) queryParams.isActive = String(params.isActive);
      if (params.roleId) queryParams.roleId = params.roleId;
      if (params.sortField) queryParams.sortField = params.sortField;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
    }

    return apiGet<ApiDepartmentMembersResponse>('/users', { params: queryParams });
  },

  /**
   * Get member by ID
   */
  getMemberById(userId: string): Promise<ApiResult<any>> {
    return apiGet<any>(`/users/${userId}`);
  },

  /**
   * Update member (limited fields for department manager)
   */
  updateMember(userId: string, data: {
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
  }): Promise<ApiResult<any>> {
    return apiPut<any>(`/users/${userId}`, data);
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
   * Approve document (department manager action)
   */
  approveDocument(id: string, comment?: string): Promise<ApiResult<any>> {
    return apiPost<any>(`/documents/${id}/approve`, { comment });
  },

  /**
   * Reject document (department manager action)
   */
  rejectDocument(id: string, comment: string): Promise<ApiResult<any>> {
    return apiPost<any>(`/documents/${id}/reject`, { comment });
  },

  /**
   * Get department activity logs
   */
  getActivityLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResult<any>> {
    const queryParams: Record<string, string | number | undefined> = {};

    if (params) {
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.action) queryParams.action = params.action;
      if (params.userId) queryParams.userId = params.userId;
      if (params.entityType) queryParams.entityType = params.entityType;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
    }

    return apiGet<any>('/audit-logs', { params: queryParams });
  },
};
