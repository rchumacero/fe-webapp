export interface Person {
    id: string;
    code: string;
    vendorCode?: string | null;
    name1: string;
    name2: string;
    name3: string;
    surname1: string;
    surname2: string;
    surname3: string;
    birthdate: string;
    gender: 'MAL' | 'FEM' | 'OTH' | null;
    type: string;
    cityOrigin: string | null;
    completeName: string;
    digitalContentCode?: string | null;
    createdBy?: string | null;
    createdAt?: string | null;
    updatedBy?: string | null;
    updatedAt?: string | null;
    deletedBy?: string | null;
    deletedAt?: string | null;
}

export interface CreatePersonDto {
    code: string;
    vendorCode?: string | null;
    name1: string;
    name2?: string;
    name3?: string;
    surname1: string;
    surname2?: string;
    surname3?: string;
    birthdate: string;
    gender: 'MAL' | 'FEM' | 'OTH' | null;
    type: string;
    cityOrigin: string | null;
    completeName: string;
}

export interface UpdatePersonDto extends Partial<CreatePersonDto> {
    id: string;
}
