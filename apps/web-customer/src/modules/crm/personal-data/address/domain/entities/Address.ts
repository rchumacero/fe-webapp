export interface Address {
    id: string;
    personId: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    priority: number;
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string | null;
    updatedAt?: string | null;
    deletedBy?: string | null;
    deletedAt?: string | null;
}

export type CreateAddressDto = Omit<Address, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'>;
export type UpdateAddressDto = Partial<CreateAddressDto> & { id: string };
