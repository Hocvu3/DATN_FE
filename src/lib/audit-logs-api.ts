import { apiGet, ApiResult } from './api';
import { getAuthToken } from './authProvider';

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  document?: {
    id: string;
    title: string;
  };
}

export interface AuditLogStats {
  totalLogs: number;
  last24Hours: number;
  last7Days: number;
  last30Days: number;
  actionStats: Array<{ action: string; count: number }>;
  resourceStats: Array<{ resource: string; count: number }>;
  topUsers: Array<{
    userId: string;
    count: number;
    user?: {
      id: string;
      email: string;
      username: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface GetAuditLogsQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  resource?: string;
  resourceId?: string;
  userId?: string;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetAuditLogsResponse {
  message: string;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get audit logs with pagination and filters
 */
export async function getAuditLogs(params?: GetAuditLogsQueryParams): Promise<ApiResult<GetAuditLogsResponse>> {
  return apiGet<GetAuditLogsResponse>('/admin/audit-logs', { params: params as any });
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats(): Promise<ApiResult<{ message: string; data: AuditLogStats }>> {
  return apiGet<{ message: string; data: AuditLogStats }>('/admin/audit-logs/stats');
}

/**
 * Get audit log by ID
 */
export async function getAuditLogById(id: string): Promise<ApiResult<{ message: string; data: AuditLog }>> {
  return apiGet<{ message: string; data: AuditLog }>(`/admin/audit-logs/${id}`);
}

/**
 * Export audit logs as CSV
 */
export async function exportAuditLogs(params?: GetAuditLogsQueryParams): Promise<Blob> {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3030";
  const queryString = queryParams.toString();
  const url = `${baseUrl}/api/admin/audit-logs/export${queryString ? `?${queryString}` : ''}`;
  
  console.log('Export URL:', url);
  
  const token = getAuthToken();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  console.log('Export response status:', response.status);
  console.log('Export response headers:', response.headers);

  if (!response.ok) {
    const text = await response.text();
    console.error('Export error response:', text);
    throw new Error(`Failed to export audit logs: ${response.status} ${response.statusText}`);
  }

  return response.blob();
}
