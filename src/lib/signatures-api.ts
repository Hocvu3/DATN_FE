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
  stamps: Signature[];
  total: number;
  page: number;
  limit: number;
}

export interface ApplySignatureDto {
  documentId: string;
  documentVersionId?: string;
  signatureStampId: string;
  reason?: string;
  type?: number; // 1 = stamp only, 2 = stamp with hash
}

export interface DigitalSignature {
  id: string;
  signatureData: string;
  certificateInfo: any;
  signedAt: string;
  ipAddress?: string;
  userAgent?: string;
  requestId: string;
  signerId: string;
  signatureStampId?: string;
  documentHash?: string;
  signatureHash?: string;
  signatureStatus?: string;
  verifiedAt?: string;
  signer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  signatureStamp?: Signature;
}

export interface SignatureVerificationResult {
  isValid: boolean;
  status: string;
  message: string;
  details: {
    currentHash?: string;
    originalHash?: string;
    hashMatch?: boolean;
    signatureValid?: boolean;
  };
}

export const SignaturesApi = {
  /**
   * Get all signature stamps (admin only)
   */
  async getAll(params?: GetSignaturesParams) {
    return apiGet<SignaturesResponse>('/stamps', { params: params as any });
  },

  /**
   * Get active signature stamps (authenticated users)
   */
  async getActive() {
    return apiGet<Signature[]>('/stamps/active');
  },

  /**
   * Get signature stamp by ID
   */
  async getById(id: string) {
    return apiGet<Signature>(`/stamps/${id}`);
  },

  /**
   * Create new signature stamp
   */
  async create(data: CreateSignatureDto) {
    return apiPost<Signature>('/stamps', data);
  },

  /**
   * Update signature stamp
   */
  async update(id: string, data: UpdateSignatureDto) {
    return apiPut<Signature>(`/stamps/${id}`, data);
  },

  /**
   * Delete signature stamp
   */
  async delete(id: string) {
    return apiDelete(`/stamps/${id}`);
  },

  /**
   * Get presigned URL for signature image upload
   */
  async getPresignedUrl(fileName: string, contentType: string) {
    return apiPost<{
      presignedUrl: string;
      key: string;
      publicUrl: string;
    }>('/stamps/presigned-url', {
      fileName,
      contentType,
    });
  },

  /**
   * Apply signature stamp to document
   */
  async applySignature(data: ApplySignatureDto) {
    return apiPost<DigitalSignature>('/stamps/apply', data);
  },

  /**
   * Get all signatures for a document
   */
  async getDocumentSignatures(documentId: string) {
    return apiGet<DigitalSignature[]>(`/stamps/documents/${documentId}/signatures`);
  },

  /**
   * Verify digital signature integrity
   */
  async verifySignature(signatureId: string) {
    return apiPost<SignatureVerificationResult>(`/stamps/verify/${signatureId}`, {});
  },

  /**
   * Get signature requests for stamping
   */
  async getSignatureRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    return apiGet<{
      success: boolean;
      message: string;
      data: {
        requests: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>('/stamps/requests', { params: params as any });
  },

  /**
   * Get signature requests (general endpoint)
   */
  async getAllSignatureRequests(params?: {
    documentVersionId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return apiGet<{
      requests: any[];
      total: number;
      page: number;
      limit: number;
    }>('/signatures/requests', { params: params as any });
  },

  /**
   * Create a signature request for a document version
   */
  async createSignatureRequest(data: {
    documentVersionId: string;
    signatureType: string;
    expiresAt: string;
    reason?: string;
  }) {
    return apiPost<any>('/signatures/requests', data);
  },

  /**
   * Sign a signature request (digital signature)
   */
  async signRequest(requestId: string, signatureData: string) {
    return apiPut<DigitalSignature>(`/signatures/requests/${requestId}/sign`, {
      signatureData
    });
  },
};
