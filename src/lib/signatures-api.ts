import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface Signature {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  s3Key: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateSignatureDto {
  name: string;
  description?: string;
  imageUrl: string;
  s3Key: string;
}

export interface UpdateSignatureDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface GetSignaturesParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface SignaturesResponse {
  signatures: Signature[];
  total: number;
  page: number;
  limit: number;
}

export const SignaturesApi = {
  /**
   * Get all signature stamps (admin only)
   */
  async getAll(params?: GetSignaturesParams) {
    return apiGet<SignaturesResponse>('/signature-stamps', { params });
  },

  /**
   * Get active signature stamps (authenticated users)
   */
  async getActive() {
    return apiGet<Signature[]>('/signature-stamps/active');
  },

  /**
   * Get signature stamp by ID
   */
  async getById(id: string) {
    return apiGet<Signature>(`/signature-stamps/${id}`);
  },

  /**
   * Create new signature stamp
   */
  async create(data: CreateSignatureDto) {
    return apiPost<Signature>('/signature-stamps', data);
  },

  /**
   * Update signature stamp
   */
  async update(id: string, data: UpdateSignatureDto) {
    return apiPut<Signature>(`/signature-stamps/${id}`, data);
  },

  /**
   * Delete signature stamp
   */
  async delete(id: string) {
    return apiDelete(`/signature-stamps/${id}`);
  },

  /**
   * Get presigned URL for signature image upload
   */
  async getPresignedUrl(fileName: string, contentType: string) {
    return apiPost<{
      presignedUrl: string;
      key: string;
      publicUrl: string;
    }>('/signature-stamps/presigned-url', {
      fileName,
      contentType,
    });
  },
};
