export interface CommercialProduct {
  id: string;
  campaignId: string;
  code: string;
  name: string;
  description: string;
  priceType: string;
  channelCode: string;
  type?: string;
  totalCost?: number;
  scheduleTypeCode?: string;
  timeBasedCode?: string;
  requireConfirmationCode?: string;
  productTypeCode?: string;
  planScheduleCode?: string;
  warehouseCode?: string;
  itemCode?: string | null;
  productCode?: string | null;
  version?: string | null;
  cost?: number | null;
  quantity?: number | null;
  unitMeasureCode?: string | null;
  configurationCode?: string | null;
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
  channelCode: string;
  scheduleTypeCode?: string;
  timeBasedCode?: string;
  requireConfirmationCode?: string;
  productTypeCode?: string;
  planScheduleCode?: string;
  warehouseCode?: string;
  itemCode?: string | null;
  productCode?: string | null;
  version?: string | null;
  cost?: number | null;
  quantity?: number | null;
  unitMeasureCode?: string | null;
  configurationCode?: string | null;
  status: string;
}

export interface UpdateCommercialProductDto extends Partial<CreateCommercialProductDto> {
  id: string;
}
