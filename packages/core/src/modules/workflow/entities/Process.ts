export interface Process {
    id: string;
    vendorCode: string;
    moduleCode: string;
    name: string;
    code: string;
    description: string;
    status: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    deletedAt?: string;
    deletedBy?: string;
}

export interface CreateProcessDto {
    vendorCode: string;
    moduleCode: string;
    name: string;
    code: string;
    description?: string;
    status?: string;
}

export interface UpdateProcessDto extends Partial<CreateProcessDto> {
    id: string;
}
