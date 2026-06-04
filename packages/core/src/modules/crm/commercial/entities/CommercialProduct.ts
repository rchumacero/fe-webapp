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
  scheduleType?: string;
  type: 'UNIQUE' | 'COMBO';
  productCode?: string;
  cost?: number;
  quantity?: number;
  unitMeasureCode?: string;
  configurationCode?: string;
  planScheduleCode?: string;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  numberProducts?: number;
}

export interface CreateCommercialProductDto {
  campaignId: string;
  code: string;
  name: string;
  description: string;
  priceType: string;
  totalCost: number;
  attentionGroupCode: string;
  channelCode: string;
  scheduleType?: string;
  type: 'UNIQUE' | 'COMBO';
  productCode?: string;
  cost?: number;
  quantity?: number;
  unitMeasureCode?: string;
  configurationCode?: string;
  planScheduleCode?: string;
  status: string;

  campaignProduct?: {
    commercialProductId?: string;
    productCode: string;
    cost: number;
    quantity: number;
    unitMeasureCode: string;
    configurationCode: string;
    planScheduleCode?: string;
  };
}

export interface UpdateCommercialProductDto extends Partial<CreateCommercialProductDto> {
  id: string;
}
