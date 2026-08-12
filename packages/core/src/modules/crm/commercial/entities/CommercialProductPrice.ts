export class CommercialProductPrice {
  id!: string;
  commercialProductId!: string;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  spread?: number | null;
  revenueAmount?: number | null;
}

export interface CreateCommercialProductPriceDto {
  commercialProductId: string;
  minQuantity?: number | null;
  maxQuantity?: number | null;
  spread?: number | null;
  revenueAmount?: number | null;
}

export interface UpdateCommercialProductPriceDto extends Partial<CreateCommercialProductPriceDto> {
  id: string;
}
