export class Promo {
  id!: string;
  commercialProductId!: string;
  code!: string;
  fromDate!: Date;
  toDate?: Date | null;
  status!: string;
  discountAmount?: number | null;
  discountPercent?: number | null;
}

export interface CreatePromoDto {
  commercialProductId: string;
  code: string;
  fromDate: Date;
  toDate?: Date | null;
  status: string;
  discountAmount?: number | null;
  discountPercent?: number | null;
}

export interface UpdatePromoDto extends Partial<CreatePromoDto> {
  id: string;
}
