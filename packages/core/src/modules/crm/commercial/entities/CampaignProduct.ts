export interface CampaignProduct {
  id: string;
  commercialProductId: string;
  cost: number;
  quantity: number;
  unitMeasureCode: string;
  itemCode?: string | null;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface CreateCampaignProductDto {
  commercialProductId: string;
  cost: number;
  quantity: number;
  unitMeasureCode: string;
  itemCode?: string | null;
  status?: string;
}

export interface UpdateCampaignProductDto extends Partial<CreateCampaignProductDto> {
  id: string;
}


