interface AuditResponseDTO {
    createdAt: string;
    createdBy: string;
    updatedAt: string | null;
    updatedBy: string | null;
    deletedAt: string | null;
    deletedBy: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
}

export interface MenuResponseDTO extends AuditResponseDTO {
    id: string;
    appId: string;
    appName: string;
    code: string;
    name: string;
    description: string;
}
