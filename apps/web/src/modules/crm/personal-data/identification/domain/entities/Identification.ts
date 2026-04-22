export interface Identification {
    id: string;
    personId: string;
    type: string;
    numberIdent: string;
    prefix: string | null;
    sufix: string | null;
    priority: number;
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string | null;
    updatedAt?: string | null;
    deletedBy?: string | null;
    deletedAt?: string | null;
}

export type CreateIdentificationDto = Omit<Identification, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>;
export type UpdateIdentificationDto = Partial<CreateIdentificationDto> & { id: string };
