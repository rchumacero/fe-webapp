export interface CommercialProduct {
  id: string;
  campaignId: string;
  code: string;
  name: string;
  description: string;
  priceType: string;
  totalCost: number;
  attentionGroupCode: string;
  channelCode: string;
  deletedAt?: null;
  deletedBy?: null;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateCommercialProductDto {
  personId: string;
  personCompId: string;
  type: string;
  relationDescription: string;
}

export interface UpdateCommercialProductDto extends CreateCommercialProductDto {
  id: string;
}
