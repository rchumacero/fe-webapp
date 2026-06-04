export interface CampaignProduct {
  id: string;
  commercialProductId: string;
  productCode: string;
  cost: number;
  quantity: number;
  unitMeasureCode: string;
  configurationCode: string;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateCampaignProductDto {
  commercialProductId: string;
  productCode: string;
  cost: number;
  quantity: number;
  unitMeasureCode: string;
  configurationCode: string;
  status?: string;
}

export interface UpdateCampaignProductDto extends Partial<CreateCampaignProductDto> {
  id: string;
}


