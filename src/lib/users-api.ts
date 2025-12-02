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
  const response = await apiPut<{ data: UserProfile }>('/users/profile', data);
  return response.data.data;
}

/**
 * Upload user avatar
 */
export async function uploadUserAvatar(file: File): Promise<string> {
  const presignedResponse = await apiPost<{ data: { uploadUrl: string; avatarUrl: string } }>(
    '/users/avatar/presigned-url',
    {
      fileName: file.name,
      fileType: file.type,
    }
  );

  const { uploadUrl, avatarUrl } = presignedResponse.data.data;

  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  await apiPost<{ data: UserProfile }>('/users/avatar', { avatarUrl });

  return avatarUrl;
}
