import { apiGet, apiPost, ApiResult } from './api';

export interface Document {
  id: string;
  title: string;
  documentNumber: string;
  description?: string;
  securityLevel: string;
  createdAt: string;
  updatedAt: string;
  latestVersion?: {
    id: string;
    versionNumber: number;
    s3Url: string;
    fileSize: number;
    createdAt: string;
  };
  creator: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export interface DocumentAnalysisResult {
  documentId: string;
  extractedText: string;
  summary: string;
  confidence: number;
  pageCount: number;
  processingTime: number;
}

export interface GetDocumentsResponse {
  success: boolean;
  message: string;
  data: {
    documents: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AnalyzeDocumentResponse {
  success: boolean;
  message: string;
  data: DocumentAnalysisResult;
}

/**
 * Get documents for OCR analysis
 */
export async function getDocumentsForOcr(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ApiResult<GetDocumentsResponse>> {
  return apiGet<GetDocumentsResponse>('/ocr/documents', { params: params as any });
}

/**
 * Analyze document with AI OCR
 * Increased timeout to 60s for multi-page PDF processing (Textract async + Bedrock)
 */
export async function analyzeDocument(documentId: string): Promise<ApiResult<AnalyzeDocumentResponse>> {
  return apiPost<AnalyzeDocumentResponse>('/ocr/analyze', { documentId }, { timeout: 60000 });
}
