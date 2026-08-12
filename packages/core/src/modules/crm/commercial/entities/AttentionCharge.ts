export class AttentionCharge {
  id!: string;
  commercialProductId!: string;
  chargeCode!: string;
  chargeAmount!: number;
  spreadPercent?: number | null;
  optional?: boolean | null;
}

export interface CreateAttentionChargeDto {
  commercialProductId: string;
  chargeCode: string;
  chargeAmount: number;
  spreadPercent?: number | null;
  optional?: boolean | null;
}

export interface UpdateAttentionChargeDto extends Partial<CreateAttentionChargeDto> {
  id: string;
}
