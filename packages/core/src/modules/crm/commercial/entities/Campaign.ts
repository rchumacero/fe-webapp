export interface Campaign {
    id: string;
    code: string;
    categoryCode?: string | null;
    name: string;
    fromDate: string;
    toDate: string;
    currencyCode: string;
    defaultSpreadPercent: number;
    status: string;
    priority: number;
    personId?: string | null;
    personName?: string | null;
    vendorId?: string | null;
    createdBy?: string | null;
    createdAt?: string | null;
    updatedBy?: string | null;
    updatedAt?: string | null;
    deletedBy?: string | null;
    deletedAt?: string | null;
}
