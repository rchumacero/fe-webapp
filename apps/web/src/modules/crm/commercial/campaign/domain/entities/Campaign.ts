export interface Campaign {
    id: string;
    code: string;
    name: string;
    fromDate: string;
    toDate: string;
    currencyCode: string;
    defaultSpreadPercent: number;
    status: string;
    priority: number;
    personId: string;
    vendorId?: string | null;
    createdBy?: string | null;
    createdAt?: string | null;
    updatedBy?: string | null;
    updatedAt?: string | null;
    deletedBy?: string | null;
    deletedAt?: string | null;
}

export interface CreateCampaignDto {
    code: string;
    name: string;
    fromDate: string;
    toDate: string;
    currencyCode: string;
    defaultSpreadPercent: number;
    status: string;
    priority: number;
    personId: string;
    vendorId?: string | null;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {
    id: string;
}
