// Document types for DocuFlow application

export enum DocumentStatus {
    DRAFT = 'DRAFT',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED'
}

export enum SecurityLevel {
    PUBLIC = 'PUBLIC',
    INTERNAL = 'INTERNAL',
    CONFIDENTIAL = 'CONFIDENTIAL',
    SECRET = 'SECRET',
    TOP_SECRET = 'TOP_SECRET'
}

export enum SignatureStatus {
    PENDING = 'PENDING',
    SIGNED = 'SIGNED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED'
}

export enum SignatureType {
    ELECTRONIC = 'ELECTRONIC',
    DIGITAL = 'DIGITAL',
    ADVANCED_DIGITAL = 'ADVANCED_DIGITAL',
    QUALIFIED_DIGITAL = 'QUALIFIED_DIGITAL'
}

export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    departmentId?: string | null;
    roleId: string;
    createdAt: string;
    updatedAt: string;
    avatar?: Asset | null;
    role?: Role;
    department?: Department | null;
}

export interface Role {
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Department {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Asset {
    id: string;
    filename: string;
    s3Url: string;
    contentType: string | null;
    sizeBytes: string | null;
    isCover: boolean;
    createdAt: string;
    ownerDocumentId?: string | null;
    uploadedById?: string | null;
    departmentId?: string | null;
    userAvatarId?: string | null;
}

export interface DocumentVersion {
    id: string;
    versionNumber: number;
    filePath: string;
    s3Key: string | null;
    s3Url: string | null;
    fileSize: number;
    checksum: string;
    mimeType: string;
    isEncrypted: boolean;
    encryptionKey: string | null;
    createdAt: string;
    documentId: string;
    creatorId: string;
    isLatest: boolean;
    comment: string | null;
    assets: Asset[];
    createdBy?: User;
}

export interface Tag {
    id: string;
    name: string;
    color: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentTag {
    id: string;
    documentId: string;
    tagId: string;
    tag: Tag;
}

export interface Comment {
    id: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    updatedAt: string;
    documentId: string;
    authorId: string;
    author: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatar?: Asset | null;
    };
}

export interface Signature {
    id: string;
    signatureData: string;
    certificateInfo: {
        issuer: string;
        validTo: string;
        validFrom: string;
        serialNumber: string;
    };
    signedAt: string;
    ipAddress: string | null;
    userAgent: string | null;
    requestId: string;
    signerId: string;
}

export interface SignatureRequest {
    id: string;
    status: SignatureStatus;
    requestedAt: string;
    signedAt: string | null;
    expiresAt: string;
    signatureType: SignatureType;
    reason: string | null;
    documentId: string;
    requesterId: string;
    signatures: Signature[];
}

export interface AuditLog {
    id: string;
    action: string;
    resource: string;
    resourceId: string;
    details: any | null;
    ipAddress: string | null;
    userAgent: string | null;
    timestamp: string;
    userId: string | null;
    documentId: string | null;
}

export interface PermissionGroup {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Document {
    id: string;
    title: string;
    description: string | null;
    documentNumber: string;
    status: DocumentStatus;
    securityLevel: SecurityLevel;
    isConfidential: boolean;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    approverId: string | null;
    departmentId: string | null;
    creator: User;
    approver: User | null;
    department: Department | null;
    versions: DocumentVersion[];
    assets: Asset[];
    tags: DocumentTag[];
    comments: Comment[];
    signatureRequests: SignatureRequest[];
    auditLogs: AuditLog[];
    cover?: Asset | null;
    permissionGroups?: PermissionGroup[];
}

export interface DocumentsResponse {
    message: string;
    documents: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface DocumentDetailResponse {
    message: string;
    document: Document;
}

// Query parameters for documents list endpoint
export interface DocumentsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: DocumentStatus;
    securityLevel?: SecurityLevel;
    isConfidential?: boolean;
    departmentId?: string;
    creatorId?: string;
    tag?: string;
    createdFrom?: string;
    createdTo?: string;
}