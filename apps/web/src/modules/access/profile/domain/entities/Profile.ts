export interface Profile {
    id: string;
    code: string;
    name: string;
    moduleCode: string;
    vendorCode: string;
    status: string;
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string | null;
    updatedAt?: string | null;
    deletedBy?: string | null;
    deletedAt?: string | null;
}

export type CreateProfileDto = Omit<Profile, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>;
export type UpdateProfileDto = Partial<CreateProfileDto> & { id: string };
