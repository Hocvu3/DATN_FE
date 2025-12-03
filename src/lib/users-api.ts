import { apiGet, apiPut, apiPost, apiPatch } from './api';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roleId: string;
  departmentId?: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
  department?: {
    id: string;
    name: string;
    description: string;
  };
  avatar?: {
    id: string;
    filename: string;
    s3Url: string;
    contentType?: string;
  };
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

/**
 * Get current user profile
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await apiGet<{ data: UserProfile }>('/users/me');
  return response.data.data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const response = await apiPut<{ data: { message: string; user: UserProfile } }>('/users/profile', data);
  // Backend returns: { data: { message: "...", user: {...} } }
  const responseData = response.data.data;
  if (responseData && typeof responseData === 'object' && 'user' in responseData) {
    return responseData.user;
  }
  // Fallback for direct data structure
  return responseData as any as UserProfile;
}

/**
 * Upload user avatar (similar to document cover upload)
 */
export async function uploadUserAvatar(file: File): Promise<string> {
  const presignedResponse = await apiPost<{ data: { uploadUrl: string; avatarUrl: string } }>(
    '/users/avatar/presigned-url',
    {
      fileName: file.name,
      fileType: file.type,
    }
  );

  // Handle nested response structure from backend
  let presignedData;
  const responseData = presignedResponse.data as any;
  if (responseData.data) {
    presignedData = responseData.data;
  } else {
    presignedData = responseData;
  }

  const { uploadUrl, avatarUrl } = presignedData;

  // Upload to S3 using presigned URL
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  // Link uploaded avatar to user profile
  await apiPost<{ data: UserProfile }>('/users/avatar', { avatarUrl });

  return avatarUrl;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    users: Array<{
      id: string;
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
      createdAt: string;
      department?: {
        id: string;
        name: string;
      };
      role?: {
        id: string;
        name: string;
      };
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
  path: string;
  duration: string;
}

/**
 * Get all users with filters
 */
export const UsersApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    isActive?: boolean;
  }): Promise<{ data: GetUsersResponse; status: number }> {
    const queryParams: Record<string, string> = {};
    
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.search) queryParams.search = params.search;
    if (params?.department) queryParams.department = params.department;
    if (params?.isActive !== undefined) queryParams.isActive = String(params.isActive);

    return apiGet<GetUsersResponse>('/admin/users', { params: queryParams });
  },
};
