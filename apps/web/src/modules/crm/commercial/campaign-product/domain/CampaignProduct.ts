export interface CampaignProduct {
  id: string;
  commercialProductId: string;
  productCode: string;
  cost: number;
  quantity: number;
  unitMeasureCode: string;
  configurationCode: string;
  deletedAt?: null;
  deletedBy?: null;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateCampaignProductDto {
  personId: string;
  personCompId: string;
  type: string;
  relationDescription: string;
}

export interface UpdateCampaignProductDto extends CreateCampaignProductDto {
  id: string;
}
